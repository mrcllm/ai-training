import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { stubBackend } from '../test/backend-stub';
import { LanguageProbe } from '../test/language-probe';
import { bomJesusPiaui, bomJesusRioGrande, suggestionsResponse } from '../test/location-fixtures';
import { renderWithLanguage } from '../test/render-with-language';
import { WeatherSearchForm } from './WeatherSearchForm';

function renderForm(isLoading = false) {
  const onSearch = vi.fn();
  const onInvalid = vi.fn();
  render(<WeatherSearchForm isLoading={isLoading} onSearch={onSearch} onInvalid={onInvalid} />);
  return { onSearch, onInvalid, input: screen.getByRole('combobox', { name: 'Cidade' }) };
}

async function selectSuggestion(input: HTMLElement, query: string, option: RegExp): Promise<void> {
  fireEvent.change(input, { target: { value: query } });
  fireEvent.click(await screen.findByRole('option', { name: option }));
}

function submit(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));
}

afterEach(() => vi.unstubAllGlobals());

describe('WeatherSearchForm — seleção explícita (TU-14)', () => {
  it('envia somente o ID da localidade selecionada', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui, bomJesusRioGrande]) }));
    const { input, onSearch } = renderForm();
    await selectSuggestion(input, 'Bom Jesus', /Rio Grande do Sul/);
    submit();
    expect(onSearch).toHaveBeenCalledWith(bomJesusRioGrande.id);
  });

  it('bloqueia o envio de texto livre sem seleção e associa a orientação ao campo', () => {
    const { input, onSearch, onInvalid } = renderForm();
    fireEvent.change(input, { target: { value: 'Bom Jesus' } });
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent('Selecione uma localidade na lista de sugestões');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Selecione uma localidade na lista de sugestões/);
    expect(onSearch).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalledOnce();
  });

  it('invalida a seleção quando qualquer caractere é editado', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui]) }));
    const { input, onSearch } = renderForm();
    await selectSuggestion(input, 'Bom', /Piauí/);
    fireEvent.change(input, { target: { value: 'Bom Jesus, Piau' } });
    submit();
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Selecione uma localidade');
  });

  it('limpa a orientação de erro ao voltar a digitar', () => {
    const { input } = renderForm();
    submit();
    fireEvent.change(input, { target: { value: 'B' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('sinaliza o carregamento sem remover os controles da ordem de foco', () => {
    const { input } = renderForm(true);
    const button = screen.getByRole('button', { name: 'Consultando…' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('disabled');
    expect(input).toHaveAttribute('readonly');
  });

  it('ignora novos envios enquanto a busca está em andamento', () => {
    const { onSearch, onInvalid } = renderForm(true);
    fireEvent.submit(screen.getByRole('button', { name: 'Consultando…' }).closest('form') as HTMLFormElement);
    expect(onSearch).not.toHaveBeenCalled();
    expect(onInvalid).not.toHaveBeenCalled();
  });

  it('TU-12 WeatherSearchForm reescreve a orientação de seleção no novo idioma e mantém o texto digitado', () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([]) }));
    render(<LanguageProvider><LanguageProbe /><WeatherSearchForm isLoading={false} onSearch={vi.fn()} onInvalid={vi.fn()} /></LanguageProvider>);
    fireEvent.change(screen.getByRole('combobox', { name: 'Cidade' }), { target: { value: 'Bom' } });
    submit();

    fireEvent.click(screen.getByRole('button', { name: 'Alternar idioma' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Select a location from the suggestion list before checking the weather.');
    expect(screen.getByRole('combobox', { name: 'City' })).toHaveValue('Bom');
  });

  it('TU-13 WeatherSearchForm exibe rótulo e botão em inglês no estado normal', () => {
    renderWithLanguage(<WeatherSearchForm isLoading={false} onSearch={vi.fn()} onInvalid={vi.fn()} />, 'en');

    expect(screen.getByRole('combobox', { name: 'City' })).toHaveAttribute('placeholder', 'E.g., São Paulo');
    expect(screen.getByRole('button', { name: 'Check weather' })).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('TU-13 WeatherSearchForm exibe rótulo e botão em inglês no estado carregando', () => {
    renderWithLanguage(<WeatherSearchForm isLoading onSearch={vi.fn()} onInvalid={vi.fn()} />, 'en');

    expect(screen.getByRole('combobox', { name: 'City' })).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Checking…' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('anuncia as sugestões e a fonte das localidades em inglês', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui, bomJesusRioGrande]) }));
    renderWithLanguage(<WeatherSearchForm isLoading={false} onSearch={vi.fn()} onInvalid={vi.fn()} />, 'en');
    fireEvent.change(screen.getByRole('combobox', { name: 'City' }), { target: { value: 'Bom Jesus' } });

    expect(await screen.findByRole('listbox', { name: 'Location suggestions' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('2 locations found. Use the arrow keys to choose and Enter to select.');
    expect(screen.getByText(/Locations by/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open-Meteo (opens in a new tab)' })).toBeVisible();
  });
});
