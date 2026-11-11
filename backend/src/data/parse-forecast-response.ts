import { AppError } from '../errors/app-error';
import { describeWeatherCode } from '../services/weather-condition';
import type { ProviderConditions } from '../types/provider-conditions';

type UnknownRecord = Record<string, unknown>;

const INVALID_PROVIDER_MESSAGE = 'O serviço de clima está temporariamente indisponível.';

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidPayload(message: string): AppError {
  return new AppError(503, 'WEATHER_PROVIDER_UNAVAILABLE', INVALID_PROVIDER_MESSAGE, message);
}

function readFiniteNumber(record: UnknownRecord, key: string): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalidPayload(`Campo numérico inválido: ${key}`);
  return value;
}

function validateUnits(units: unknown): void {
  if (!isRecord(units) || units.temperature_2m !== '°C' || units.apparent_temperature !== '°C') {
    throw invalidPayload('Unidade de temperatura inválida');
  }
  if (units.relative_humidity_2m !== '%' || units.wind_speed_10m !== 'km/h') {
    throw invalidPayload('Unidade meteorológica inválida');
  }
}

export function parseForecastResponse(payload: unknown): ProviderConditions {
  if (!isRecord(payload) || !isRecord(payload.current)) throw invalidPayload('Condições atuais ausentes');
  validateUnits(payload.current_units);
  const current = payload.current;
  const humidity = readFiniteNumber(current, 'relative_humidity_2m');
  const code = readFiniteNumber(current, 'weather_code');
  if (humidity < 0 || humidity > 100) throw invalidPayload('Umidade fora do intervalo permitido');
  if (!Number.isInteger(code)) throw invalidPayload('Código WMO inválido');
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
