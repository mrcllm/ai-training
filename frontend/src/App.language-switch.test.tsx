import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { fetchWeather } from './services/weather-service';
import { searchCity, selectLanguage } from './test/app-actions';
import { weatherResponse } from './test/weather-fixtures';
import type { WeatherResponse } from './types/weather-response';

vi.mock('./services/weather-service', () => ({ fetchWeather: vi.fn() }));

const mockedFetchWeather = vi.mocked(fetchWeather);
const overcastResponse: WeatherResponse = {
  ...weatherResponse,
  current: { ...weatherResponse.current, condition: { code: 3, label: 'Encoberto' } },
};

beforeEach(() => vi.resetAllMocks());

describe('App language switch', () => {
  it('TI-02 trocar para EN com resultado exibido mantém o resultado e não consulta o backend', async () => {
    mockedFetchWeather.mockResolvedValue(weatherResponse);
    render(<App />);
    searchCity('Lisboa');
    await screen.findByText('Parcialmente nublado');

    selectLanguage('EN English');

    expect(screen.getByText('Partly cloudy')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Lisboa, Lisboa, Portugal' })).toBeVisible();
    expect(screen.getByText('18.4 °C')).toBeVisible();
    expect(mockedFetchWeather).toHaveBeenCalledTimes(1);
  });

  it('TI-03 trocar para EN durante a consulta não cancela a busca e exibe o resultado em inglês', async () => {
    let finishSearch: (value: WeatherResponse) => void = () => undefined;
    let requestSignal: AbortSignal | undefined;
    mockedFetchWeather.mockImplementation((_city, signal) => {
      requestSignal = signal;
      return new Promise<WeatherResponse>((resolve) => { finishSearch = resolve; });
    });
    render(<App />);
    searchCity('Lisboa');

    selectLanguage('EN English');
    expect(screen.getByRole('status')).toHaveTextContent('Checking current conditions…');
    await act(async () => finishSearch(weatherResponse));

    expect(screen.getByText('Partly cloudy')).toBeVisible();
    expect(requestSignal?.aborted).toBe(false);
  });

  it('TI-05 erro de cidade não encontrada é reescrito em inglês', async () => {
    mockedFetchWeather.mockRejectedValueOnce({ kind: 'not-found' });
    render(<App />);
    searchCity('Atlantis');
    await screen.findByRole('alert');

    selectLanguage('EN English');

    expect(screen.getByRole('alert')).toHaveTextContent('City not found. Check the name and try again.');
  });

  it('TI-05 após o erro em inglês uma nova tentativa exibe o resultado', async () => {
    mockedFetchWeather.mockRejectedValueOnce({ kind: 'not-found' }).mockResolvedValueOnce(weatherResponse);
    render(<App />);
    searchCity('Atlantis');
    await screen.findByRole('alert');
    selectLanguage('EN English');

    searchCity('Lisboa');

    expect(await screen.findByText('Partly cloudy')).toBeVisible();
  });

  it('TI-06 nova busca após trocar para EN exibe o resultado em inglês', async () => {
    mockedFetchWeather.mockResolvedValueOnce(weatherResponse).mockResolvedValueOnce(overcastResponse);
    render(<App />);
    selectLanguage('EN English');
    searchCity('Lisboa');
    await screen.findByText('Partly cloudy');

    searchCity('Porto');

    expect(await screen.findByText('Overcast')).toBeVisible();
  });
});
