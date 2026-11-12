import { invalidWeatherProviderPayload } from '../errors/provider-unavailable';
import { describeWeatherCode } from '../services/weather-condition';
import type { ProviderConditions } from '../types/provider-conditions';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readFiniteNumber(record: UnknownRecord, key: string): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalidWeatherProviderPayload(`Campo numérico inválido: ${key}`);
  return value;
}

function validateUnits(units: unknown): void {
  if (!isRecord(units) || units.temperature_2m !== '°C' || units.apparent_temperature !== '°C') {
    throw invalidWeatherProviderPayload('Unidade de temperatura inválida');
  }
  if (units.relative_humidity_2m !== '%' || units.wind_speed_10m !== 'km/h') {
    throw invalidWeatherProviderPayload('Unidade meteorológica inválida');
  }
}

export function parseForecastResponse(payload: unknown): ProviderConditions {
  if (!isRecord(payload) || !isRecord(payload.current)) throw invalidWeatherProviderPayload('Condições atuais ausentes');
  validateUnits(payload.current_units);
  const current = payload.current;
  const humidity = readFiniteNumber(current, 'relative_humidity_2m');
  const code = readFiniteNumber(current, 'weather_code');
  if (humidity < 0 || humidity > 100) throw invalidWeatherProviderPayload('Umidade fora do intervalo permitido');
  if (!Number.isInteger(code)) throw invalidWeatherProviderPayload('Código WMO inválido');
  return {
    current: {
      temperature: readFiniteNumber(current, 'temperature_2m'),
      apparentTemperature: readFiniteNumber(current, 'apparent_temperature'),
      condition: { code, label: describeWeatherCode(code) },
      humidity,
      windSpeed: readFiniteNumber(current, 'wind_speed_10m'),
    },
    units: { temperature: '°C', apparentTemperature: '°C', humidity: '%', windSpeed: 'km/h' },
  };
}
