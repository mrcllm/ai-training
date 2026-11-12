import { fireEvent, render, screen, type RenderResult } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageProbe } from '../test/language-probe';
import { LanguageProvider } from './LanguageProvider';

function ActiveLanguage() {
  const { language, messages } = useLanguage();
  return <p>{`${language}: ${messages.search.submit}`}</p>;
}

function renderProvider(): RenderResult {
  return render(<LanguageProvider><LanguageProbe /><ActiveLanguage /></LanguageProvider>);
}

describe('LanguageProvider', () => {
  it('TU-10 LanguageProvider inicia em pt-BR e sincroniza lang e título do documento', () => {
    renderProvider();

    expect(screen.getByText('pt-BR: Consultar clima')).toBeVisible();
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.title).toBe('Clima agora — condições atuais por cidade');
  });

  it('TU-11 LanguageProvider atualiza lang e título ao trocar para en', () => {
    renderProvider();

    fireEvent.click(screen.getByRole('button', { name: 'Alternar idioma' }));

    expect(screen.getByText('en: Check weather')).toBeVisible();
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Weather now — current conditions by city');
  });

  it('TU-11 LanguageProvider restaura lang e título ao voltar para pt-BR', () => {
    renderProvider();

    fireEvent.click(screen.getByRole('button', { name: 'Alternar idioma' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alternar idioma' }));

    expect(screen.getByText('pt-BR: Consultar clima')).toBeVisible();
    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.title).toBe('Clima agora — condições atuais por cidade');
  });

  it('useLanguage sem provider usa pt-BR e ignora pedidos de troca', () => {
    render(<><LanguageProbe /><ActiveLanguage /></>);

    fireEvent.click(screen.getByRole('button', { name: 'Alternar idioma' }));

    expect(screen.getByText('pt-BR: Consultar clima')).toBeVisible();
  });
});
