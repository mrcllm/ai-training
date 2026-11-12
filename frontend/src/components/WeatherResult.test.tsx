import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherResult } from './WeatherResult';
import { renderWithLanguage } from '../test/render-with-language';
import { weatherResponse } from '../test/weather-fixtures';

describe('WeatherResult', () => {
  it('shows the location, current conditions, metrics, and source', () => {
    render(<WeatherResult weather={weatherResponse} />);

    expect(screen.getByRole('heading', { name: 'Lisboa, Lisboa, Portugal' })).toBeVisible();
    expect(screen.getByText('18.4 °C')).toBeVisible();
    expect(screen.getByText('Parcialmente nublado')).toBeVisible();
    expect(screen.getByText('17.9 °C')).toBeVisible();
    expect(screen.getByText('72 %')).toBeVisible();
    expect(screen.getByText('14.2 km/h')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', 'https://open-meteo.com/');
  });

  it('TU-16 WeatherResult em inglês traduz rótulos e condição sem alterar valores, unidades e localidade', () => {
    renderWithLanguage(<WeatherResult weather={weatherResponse} />, 'en');

    expect(screen.getByText('Partly cloudy')).toBeVisible();
    expect(screen.getByText('Location found')).toBeVisible();
    expect(screen.getByText('Current temperature')).toBeVisible();
    expect(screen.getByText('Feels like')).toBeVisible();
    expect(screen.getByText('Relative humidity')).toBeVisible();
    expect(screen.getByText('Wind speed')).toBeVisible();
    expect(screen.getByText(/Data by/)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Lisboa, Lisboa, Portugal' })).toBeVisible();
    expect(screen.getByText('18.4 °C')).toBeVisible();
    expect(screen.getByText('17.9 °C')).toBeVisible();
    expect(screen.getByText('72 %')).toBeVisible();
    expect(screen.getByText('14.2 km/h')).toBeVisible();
  });
});
