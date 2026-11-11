import { describe, expect, it } from 'vitest';
import { AppError } from '../errors/app-error';
import validPayload from './fixtures/forecast-valid.json';
import invalidPayload from './fixtures/forecast-invalid.json';
import { parseForecastResponse } from './parse-forecast-response';

describe('parseForecastResponse', () => {
  it('normaliza condições e unidades métricas válidas', () => {
    expect(parseForecastResponse(validPayload)).toEqual({
      current: {
        temperature: 18.4,
        apparentTemperature: 17.9,
        condition: { code: 2, label: 'Parcialmente nublado' },
        humidity: 72,
        windSpeed: 14.2,
      },
      units: { temperature: '°C', apparentTemperature: '°C', humidity: '%', windSpeed: 'km/h' },
    });
  });

  it.each([null, {}, { ...validPayload, current: null }, invalidPayload])('rejeita condições ausentes ou inválidas', (payload) => {
    expect(() => parseForecastResponse(payload)).toThrowError(AppError);
  });

  it.each([
    ['temperature_2m', 'not-a-number'],
    ['apparent_temperature', Number.POSITIVE_INFINITY],
    ['relative_humidity_2m', -1],
    ['relative_humidity_2m', 101],
    ['weather_code', 98],
    ['wind_speed_10m', Number.NaN],
  ])('rejeita o valor inválido de %s', (key, value) => {
    const current = { ...validPayload.current, [key]: value };
    expect(() => parseForecastResponse({ ...validPayload, current })).toThrowError(
      expect.objectContaining({ code: 'WEATHER_PROVIDER_UNAVAILABLE', statusCode: 503 }),
    );
  });

  it.each([
    ['temperature_2m', '°F'],
    ['apparent_temperature', '°F'],
    ['relative_humidity_2m', 'g/kg'],
    ['wind_speed_10m', 'mph'],
  ])('rejeita a unidade inesperada de %s', (key, unit) => {
    const current_units = { ...validPayload.current_units, [key]: unit };
    expect(() => parseForecastResponse({ ...validPayload, current_units })).toThrowError(AppError);
  });
});
