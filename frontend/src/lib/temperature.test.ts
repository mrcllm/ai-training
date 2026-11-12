import { describe, expect, it } from 'vitest';
import { convertCelsiusToFahrenheit, formatTemperature, getNextTemperatureUnit } from './temperature';

describe('convertCelsiusToFahrenheit', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [22.5, 72.5],
    [-3.2, 26.2],
    [37, 98.6],
  ])('TU-01 converte %s °C em %s °F conforme a tabela de referência', (celsius, fahrenheit) => {
    const result = convertCelsiusToFahrenheit(celsius);
    expect(result).toBe(fahrenheit);
  });

  it('TU-02 normaliza zero negativo para zero', () => {
    const result = convertCelsiusToFahrenheit(-17.8);
    expect(result).toBe(0);
  });
});

describe('formatTemperature', () => {
  it('TU-03 formata o valor convertido com o símbolo °F', () => {
    const results = [formatTemperature(25, '°F'), formatTemperature(27, '°F')];
    expect(results).toEqual(['77 °F', '80.6 °F']);
  });

  it('TU-04 preserva o valor original em °C sem arredondar', () => {
    const result = formatTemperature(22.5, '°C');
    expect(result).toBe('22.5 °C');
  });

  it('TU-05 nunca exibe "-0" em °F', () => {
    const result = formatTemperature(-17.8, '°F');
    expect(result).toBe('0 °F');
  });
});

describe('getNextTemperatureUnit', () => {
  it('TU-06 alterna entre Celsius e Fahrenheit', () => {
    const results = [getNextTemperatureUnit('°C'), getNextTemperatureUnit('°F')];
    expect(results).toEqual(['°F', '°C']);
  });
});
