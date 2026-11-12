import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubBackend } from '../test/backend-stub';
import { LocationAutocompleteHarness } from '../test/location-autocomplete-harness';
import { bomJesusPiaui, bomJesusRioGrande, suggestionsResponse } from '../test/location-fixtures';

function renderAutocomplete() {
  const onSelect = vi.fn();
  render(<LocationAutocompleteHarness onSelect={onSelect} />);
  return { onSelect, input: screen.getByRole('combobox', { name: 'Cidade' }) };
}

async function typeAndWaitForOptions(input: HTMLElement, value: string): Promise<void> {
  fireEvent.change(input, { target: { value } });
  await screen.findByRole('listbox', { name: 'Sugestões de localidade' });
}

afterEach(() => vi.unstubAllGlobals());

describe('LocationAutocomplete — semântica e feedback (TU-12)', () => {
  it('expõe combobox recolhido e sem opção ativa antes da busca', () => {
    const { input } = renderAutocomplete();
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('lista as sugestões com cidade e estado e anuncia a quantidade', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui, bomJesusRioGrande]) }));
    const { input } = renderAutocomplete();
    await typeAndWaitForOptions(input, 'Bom Jesus');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Bom JesusPiauí, Brasil', 'Bom JesusRio Grande do Sul, Brasil']);
    expect(screen.getByRole('status')).toHaveTextContent('2 localidades encontradas');
    expect(screen.getByRole('link', { name: /Open-Meteo/ })).toHaveAttribute('href', 'https://open-meteo.com/');
  });

  it('anuncia carregamento enquanto a busca está em andamento', async () => {
    stubBackend(() => new Promise(() => undefined));
    const { input } = renderAutocomplete();
    fireEvent.change(input, { target: { value: 'Bom' } });
    expect(await screen.findByText('Buscando localidades…')).toBeInTheDocument();
  });

  it('anuncia ausência de resultados sem abrir lista', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([]) }));
    const { input } = renderAutocomplete();
    fireEvent.change(input, { target: { value: 'zzzz' } });
    expect(await screen.findByText('Nenhuma localidade encontrada. Revise o texto digitado.')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('anuncia falha e recupera com nova tentativa mantendo o campo editável', async () => {
    let calls = 0;
    stubBackend(() => {
      calls += 1;
      return calls === 1 ? { ok: false, body: { error: { code: 'LOCATION_PROVIDER_UNAVAILABLE' } } } : { ok: true, body: suggestionsResponse([bomJesusPiaui]) };
    });
    const { input } = renderAutocomplete();
    fireEvent.change(input, { target: { value: 'Bom' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível buscar localidades agora');
    expect(input).not.toHaveAttribute('readonly');
    fireEvent.blur(input);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('option', { name: /Piauí/ })).toBeVisible();
    expect(input).toHaveFocus();
  });
});

describe('LocationAutocomplete — teclado (TU-11)', () => {
  it('ativa opções por setas via aria-activedescendant sem mover o foco', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui, bomJesusRioGrande]) }));
    const { input } = renderAutocomplete();
    input.focus();
    await typeAndWaitForOptions(input, 'Bom Jesus');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const active = screen.getByRole('option', { name: /Rio Grande do Sul/ });
    expect(input).toHaveAttribute('aria-activedescendant', active.id);
    expect(active).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveFocus();
  });

  it('Enter seleciona a opção ativa, preenche o campo e fecha a lista', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui, bomJesusRioGrande]) }));
    const { input, onSelect } = renderAutocomplete();
    await typeAndWaitForOptions(input, 'Bom Jesus');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(bomJesusPiaui);
    expect(input).toHaveValue('Bom Jesus, Piauí');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Escape fecha a lista sem alterar o texto', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui]) }));
    const { input, onSelect } = renderAutocomplete();
    await typeAndWaitForOptions(input, 'Bom');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveValue('Bom');
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('LocationAutocomplete — ponteiro (TU-13)', () => {
  it('seleciona a opção clicada antes do blur e mantém a escolhida', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui, bomJesusRioGrande]) }));
    const { input, onSelect } = renderAutocomplete();
    await typeAndWaitForOptions(input, 'Bom Jesus');
    const option = screen.getByRole('option', { name: /Rio Grande do Sul/ });
    expect(fireEvent.mouseDown(option)).toBe(false);
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith(bomJesusRioGrande);
    expect(input).toHaveValue('Bom Jesus, Rio Grande do Sul');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('fecha a lista ao sair do campo sem selecionar', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui]) }));
    const { input, onSelect } = renderAutocomplete();
    await typeAndWaitForOptions(input, 'Bom');
    fireEvent.blur(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
