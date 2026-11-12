import { fireEvent, render, screen, type RenderResult } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { LanguageSwitcher } from './LanguageSwitcher';

function renderSwitcher(): RenderResult {
  return render(<LanguageProvider><LanguageSwitcher /></LanguageProvider>);
}

describe('LanguageSwitcher', () => {
  it('TU-06 LanguageSwitcher expõe grupo nomeado com PT pressionado por padrão', () => {
    renderSwitcher();

    expect(screen.getByRole('group', { name: 'Idioma' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'PT Português (Brasil)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN English' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('TU-07 opções do seletor têm nome acessível com sigla e nome nativo e declaram o próprio idioma', () => {
    renderSwitcher();

    expect(screen.getByRole('button', { name: 'PT Português (Brasil)' })).toHaveAttribute('lang', 'pt-BR');
    expect(screen.getByRole('button', { name: 'EN English' })).toHaveAttribute('lang', 'en');
  });

  it('TU-08 acionar EN troca o idioma e atualiza o estado pressionado e o nome do grupo', () => {
    renderSwitcher();

    fireEvent.click(screen.getByRole('button', { name: 'EN English' }));

    expect(screen.getByRole('group', { name: 'Language' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'EN English' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'PT Português (Brasil)' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('TU-09 acionar o idioma ativo não altera a interface', () => {
    const { container } = renderSwitcher();
    const markupBefore = container.innerHTML;

    fireEvent.click(screen.getByRole('button', { name: 'PT Português (Brasil)' }));

    expect(container.innerHTML).toBe(markupBefore);
    expect(document.documentElement.lang).toBe('pt-BR');
  });
});
