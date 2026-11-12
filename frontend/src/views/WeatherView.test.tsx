import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather } from '../services/weather-service';
import { weatherResponse } from '../test/weather-fixtures';
import { WeatherView } from './WeatherView';

vi.mock('../services/weather-service', () => ({ fetchWeather: vi.fn() }));

const mockedFetchWeather = vi.mocked(fetchWeather);

beforeEach(() => vi.resetAllMocks());

describe('WeatherView', () => {
  it('shows the weather search and the result after a successful lookup', async () => {
    mockedFetchWeather.mockResolvedValue(weatherResponse);
    render(<WeatherView />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: 'Lisboa' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Lisboa, Lisboa, Portugal' })).toBeVisible());
    expect(screen.getByText('Parcialmente nublado')).toBeVisible();
  });

  it('presents errors returned from the weather service', async () => {
    mockedFetchWeather.mockRejectedValue({ kind: 'not-found' });
    render(<WeatherView />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: 'Atlantis' } });
    fireEvent.click(screen.getByRole('button', { name: 'Consultar clima' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cidade não encontrada. Revise o nome e tente novamente.');
  });
});
