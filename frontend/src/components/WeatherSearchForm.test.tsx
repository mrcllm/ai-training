import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { LanguageProbe } from '../test/language-probe';
import { renderWithLanguage } from '../test/render-with-language';
import { WeatherSearchForm } from './WeatherSearchForm';

describe('WeatherSearchForm', () => {
  it('submits a trimmed city name', () => {
    const onSearch = vi.fn();
    render(<WeatherSearchForm isLoading={false} onSearch={onSearch} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: '  Lisboa  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));

    expect(onSearch).toHaveBeenCalledWith('Lisboa');
  });

  it('shows validation feedback and does not submit a too short name', () => {
    const onSearch = vi.fn();
    render(<WeatherSearchForm isLoading={false} onSearch={onSearch} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));

    expect(screen.getByRole('alert')).toHaveTextContent('pelo menos 2 caracteres');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('disables controls while a search is loading', () => {
    render(<WeatherSearchForm isLoading onSearch={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Consultando…' })).toBeDisabled();
  });

  it('TU-12 WeatherSearchForm reescreve a mensagem de validação no novo idioma e mantém o texto digitado', () => {
    render(<LanguageProvider><LanguageProbe /><WeatherSearchForm isLoading={false} onSearch={vi.fn()} /></LanguageProvider>);
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: 'a' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));

    fireEvent.click(screen.getByRole('button', { name: 'Alternar idioma' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a city with at least 2 characters.');
    expect(screen.getByRole('textbox', { name: 'City' })).toHaveValue('a');
  });

  it('TU-13 WeatherSearchForm exibe rótulo e botão em inglês no estado normal', () => {
    renderWithLanguage(<WeatherSearchForm isLoading={false} onSearch={vi.fn()} />, 'en');

    expect(screen.getByRole('textbox', { name: 'City' })).toHaveAttribute('placeholder', 'E.g., São Paulo');
    expect(screen.getByRole('button', { name: 'Check weather' })).toBeEnabled();
  });

  it('TU-13 WeatherSearchForm exibe rótulo e botão em inglês no estado carregando', () => {
    renderWithLanguage(<WeatherSearchForm isLoading onSearch={vi.fn()} />, 'en');

    expect(screen.getByRole('textbox', { name: 'City' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Checking…' })).toBeDisabled();
  });
});
