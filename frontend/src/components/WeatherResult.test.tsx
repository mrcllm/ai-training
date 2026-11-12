import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WeatherResult } from './WeatherResult';
import { weatherResponse } from '../test/weather-fixtures';
import type { TemperatureUnit } from '../types/temperature-unit';

function renderResult(temperatureUnit: TemperatureUnit, onToggleTemperatureUnit = vi.fn()) {
  render(<WeatherResult weather={weatherResponse} temperatureUnit={temperatureUnit} onToggleTemperatureUnit={onToggleTemperatureUnit} />);
}

function getMetricValue(label: string): Element | null {
  return screen.getByText(label).nextElementSibling;
}

describe('WeatherResult', () => {
  it('exibe localidade, medições, unidades e atribuição', () => {
    renderResult('°C');
    expect(screen.getByRole('heading', { name: 'Lisboa, Lisboa, Portugal' })).toBeInTheDocument();
    expect(screen.getByText('Temperatura atual').previousElementSibling).toHaveTextContent('18.4 °C');
    expect(getMetricValue('Sensação térmica')).toHaveTextContent('17.9 °C');
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(getMetricValue('Umidade relativa')).toHaveTextContent('72 %');
    expect(getMetricValue('Velocidade do vento')).toHaveTextContent('14.2 km/h');
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', 'https://open-meteo.com/');
  });

  it('TU-15 em °F exibe a temperatura atual convertida', () => {
    renderResult('°F');
    expect(screen.getByText('Temperatura atual').previousElementSibling).toHaveTextContent('65.1 °F');
  });

  it('TU-16 em °F exibe a sensação térmica convertida', () => {
    renderResult('°F');
    expect(getMetricValue('Sensação térmica')).toHaveTextContent('64.2 °F');
  });

  it('TU-17 em °F mantém umidade e vento', () => {
    renderResult('°F');
    expect([getMetricValue('Umidade relativa')?.textContent, getMetricValue('Velocidade do vento')?.textContent]).toEqual(['72 %', '14.2 km/h']);
  });

  it('TU-18 em °F mantém localidade, condição e atribuição', () => {
    renderResult('°F');
    expect(screen.getByRole('heading', { name: 'Lisboa, Lisboa, Portugal' })).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', 'https://open-meteo.com/');
  });

  it('TU-19 em °C exibe os valores originais das temperaturas', () => {
    renderResult('°C');
    expect([screen.getByText('Temperatura atual').previousElementSibling?.textContent, getMetricValue('Sensação térmica')?.textContent]).toEqual(['18.4 °C', '17.9 °C']);
  });

  it('TU-20 encaminha o acionamento do botão de alternância', async () => {
    const user = userEvent.setup();
    const onToggleTemperatureUnit = vi.fn();
    renderResult('°C', onToggleTemperatureUnit);
    await user.click(screen.getByRole('button', { name: /^Mostrar em °F/ }));
    expect(onToggleTemperatureUnit).toHaveBeenCalledTimes(1);
  });
});
