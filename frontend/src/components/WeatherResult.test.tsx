import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherResult } from './WeatherResult';
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
});
