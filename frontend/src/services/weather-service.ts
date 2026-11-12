import type { ApiErrorCode, UiWeatherError } from '../types/api-error';
import type { WeatherResponse } from '../types/weather-response';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';
const ERROR_KINDS: Record<ApiErrorCode, UiWeatherError> = {
  INVALID_CITY: { kind: 'validation' },
  CITY_NOT_FOUND: { kind: 'not-found' },
  WEATHER_PROVIDER_UNAVAILABLE: { kind: 'unavailable' },
  INTERNAL_ERROR: { kind: 'unavailable' },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWeatherResponse(value: unknown): value is WeatherResponse {
  if (!isRecord(value) || !isRecord(value.location) || !isRecord(value.current)) return false;
  return hasLocation(value.location) && hasConditions(value.current)
    && isWeatherMetadata(value.units, value.source);
}

function hasLocation(value: Record<string, unknown>): boolean {
  return typeof value.name === 'string'
    && (typeof value.admin1 === 'string' || value.admin1 === null)
    && (typeof value.country === 'string' || value.country === null);
}

function hasConditions(value: Record<string, unknown>): boolean {
  if (!isRecord(value.condition)) return false;
  return isFiniteNumber(value.temperature) && isFiniteNumber(value.apparentTemperature)
    && isFiniteNumber(value.humidity) && isFiniteNumber(value.windSpeed)
    && isFiniteNumber(value.condition.code) && typeof value.condition.label === 'string';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isWeatherMetadata(units: unknown, source: unknown): boolean {
  if (!isRecord(units) || !isRecord(source)) return false;
  return units.temperature === '°C' && units.apparentTemperature === '°C'
    && units.humidity === '%' && units.windSpeed === 'km/h'
    && source.name === 'Open-Meteo' && source.url === 'https://open-meteo.com/';
}

function getApiErrorCode(value: unknown): ApiErrorCode | undefined {
  if (!isRecord(value) || !isRecord(value.error)) return undefined;
  const code = value.error.code;
  return typeof code === 'string' && Object.prototype.hasOwnProperty.call(ERROR_KINDS, code)
    ? code as ApiErrorCode : undefined;
}

export async function fetchWeather(city: string, signal: AbortSignal): Promise<WeatherResponse> {
  const endpoint = new URL('/weather', API_BASE_URL);
  endpoint.searchParams.set('city', city);
  const response = await fetch(endpoint, { signal });
  const payload: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw ERROR_KINDS[getApiErrorCode(payload) ?? 'WEATHER_PROVIDER_UNAVAILABLE'];
  if (!isWeatherResponse(payload)) throw ERROR_KINDS.WEATHER_PROVIDER_UNAVAILABLE;
  return payload;
}
