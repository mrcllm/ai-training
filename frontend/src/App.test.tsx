import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { fetchWeather } from './services/weather-service';
import { searchCity, selectLanguage, stubLocationSearch } from './test/app-actions';
import { weatherResponse } from './test/weather-fixtures';

vi.mock('./services/weather-service', () => ({ fetchWeather: vi.fn() }));

const mockedFetchWeather = vi.mocked(fetchWeather);

beforeEach(() => {
  vi.resetAllMocks();
  stubLocationSearch();
});

afterEach(() => vi.unstubAllGlobals());

describe('App', () => {
  it('renders the weather panel and city search', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'O tempo da sua cidade, sem rodeios.' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Cidade' })).toBeEnabled();
  });

  it('TI-01 App abre em PT-BR com o provider ativo e o seletor em PT', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'PT Português (Brasil)' })).toHaveAttribute('aria-pressed', 'true');

    selectLanguage('EN English');

    expect(screen.getByRole('heading', { name: "Your city's weather, straight to the point." })).toBeVisible();
    expect(screen.getByRole('button', { name: 'EN English' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('TI-04 trocar o idioma preserva o texto digitado e não dispara busca', () => {
    render(<App />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Cidade' }), { target: { value: 'Curitiba' } });

    selectLanguage('EN English');

    expect(screen.getByRole('combobox', { name: 'City' })).toHaveValue('Curitiba');
    expect(mockedFetchWeather).not.toHaveBeenCalled();
  });

  it('TI-07 voltar para PT restaura exatamente os textos em português', async () => {
    mockedFetchWeather.mockResolvedValue(weatherResponse);
    const { container } = render(<App />);
    await searchCity('Lisboa');
    await screen.findByText('Parcialmente nublado');
    const portugueseText = container.textContent;

    selectLanguage('EN English');
    selectLanguage('PT Português (Brasil)');

    expect(container.textContent).toBe(portugueseText);
  });
});
