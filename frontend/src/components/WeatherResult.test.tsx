import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherResult } from './WeatherResult';
import { weatherResponse } from '../test/weather-fixtures';

describe('WeatherResult', () => {
  it('mostra a localidade, as condições atuais e as métricas em formato brasileiro', () => {
    render(<WeatherResult weather={weatherResponse} />);
    expect(screen.getByRole('heading', { name: 'Lisboa, Lisboa, Portugal' })).toBeVisible();
    expect(screen.getByText('18,4 °C')).toBeVisible();
    expect(screen.getByText('Parcialmente nublado')).toBeVisible();
    expect(screen.getByText('17,9 °C')).toBeVisible();
    expect(screen.getByText('72 %')).toBeVisible();
    expect(screen.getByText('14,2 km/h')).toBeVisible();
  });

  it('exibe a atribuição à fonte com link funcional e aviso de nova aba (BUG-06)', () => {
    render(<WeatherResult weather={weatherResponse} />);
    const link = screen.getByRole('link', { name: 'Open-Meteo (abre em nova aba)' });
    expect(link).toHaveAttribute('href', 'https://open-meteo.com/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText(/Dados meteorológicos por/)).toBeVisible();
  });

  it('não marca o resultado inteiro como live region para evitar anúncios duplicados', () => {
    render(<WeatherResult weather={weatherResponse} />);
    expect(screen.getByRole('region', { name: 'Lisboa, Lisboa, Portugal' })).not.toHaveAttribute('aria-live');
  });
});
