import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather } from '../services/weather-service';
import { stubBackend } from '../test/backend-stub';
import { bomJesusPiaui, suggestionsResponse } from '../test/location-fixtures';
import { weatherResponse } from '../test/weather-fixtures';
import { WeatherView } from './WeatherView';

vi.mock('../services/weather-service', () => ({ fetchWeather: vi.fn() }));

const mockedFetchWeather = vi.mocked(fetchWeather);

async function selectAndSubmit(): Promise<void> {
  fireEvent.change(screen.getByRole('combobox', { name: 'Cidade' }), { target: { value: 'Bom' } });
  fireEvent.click(await screen.findByRole('option', { name: /Piauí/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));
}

beforeEach(() => {
  vi.resetAllMocks();
  stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui]) }));
});

afterEach(() => vi.unstubAllGlobals());

describe('WeatherView', () => {
  it('consulta o clima pelo ID selecionado e mostra o resultado', async () => {
    mockedFetchWeather.mockResolvedValue(weatherResponse);
    render(<WeatherView />);
    await selectAndSubmit();
    expect(await screen.findByRole('heading', { name: 'Lisboa, Lisboa, Portugal' })).toBeVisible();
    expect(mockedFetchWeather).toHaveBeenCalledWith(bomJesusPiaui.id, expect.any(AbortSignal));
  });

  it('apresenta erros retornados pelo weather service', async () => {
    mockedFetchWeather.mockRejectedValue({ kind: 'not-found' });
    render(<WeatherView />);
    await selectAndSubmit();
    expect(await screen.findByRole('alert')).toHaveTextContent('A localidade selecionada não está mais disponível. Selecione-a novamente.');
  });

  it('explica que a consulta usa a localidade escolhida nas sugestões', () => {
    render(<WeatherView />);
    expect(screen.getByText(/escolha uma das sugestões/)).toBeVisible();
    expect(screen.queryByText(/localidade mais relevante/)).not.toBeInTheDocument();
  });
});
