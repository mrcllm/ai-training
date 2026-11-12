import { describe, expect, it } from 'vitest';
import { formatLocation, formatMeasurement } from './weather-formatters';

describe('formatMeasurement', () => {
  it.each([
    [18.4, '°C', '18,4 °C'],
    [-3.5, '°C', '-3,5 °C'],
    [72, '%', '72 %'],
    [14.2, 'km/h', '14,2 km/h'],
  ])('formata %d %s com separador decimal brasileiro (BUG-05)', (value, unit, expected) => {
    expect(formatMeasurement(value, unit)).toBe(expected);
  });
});

describe('formatLocation', () => {
  it('une cidade, divisão administrativa e país', () => {
    expect(formatLocation({ name: 'Paris', admin1: 'Île-de-France', country: 'França' })).toBe('Paris, Île-de-France, França');
  });

  it('omite partes ausentes da localidade', () => {
    expect(formatLocation({ name: 'Localidade remota', admin1: null, country: null })).toBe('Localidade remota');
  });
});
