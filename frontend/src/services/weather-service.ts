import { getJson, isRecord, isSourceAttribution, readApiErrorCode } from './api-client';
import type { UiWeatherError } from '../types/api-error';
import type { WeatherResponse } from '../types/weather-response';

const UNAVAILABLE_ERROR: UiWeatherError = {
  kind: 'unavailable',
  message: 'Não foi possível consultar o clima agora. Tente novamente em instantes.',
};
const ERRORS = {
  INVALID_LOCATION_ID: { kind: 'validation', message: 'Selecione uma localidade da lista antes de consultar o clima.' },
  LOCATION_NOT_FOUND: { kind: 'not-found', message: 'A localidade selecionada não está mais disponível. Selecione-a novamente.' },
  WEATHER_PROVIDER_UNAVAILABLE: UNAVAILABLE_ERROR,
  INTERNAL_ERROR: UNAVAILABLE_ERROR,
} satisfies Record<string, UiWeatherError>;

function isWeatherResponse(value: unknown): value is WeatherResponse {
  if (!isRecord(value) || !isRecord(value.location) || !isRecord(value.current)) return false;
  return hasLocation(value.location) && hasConditions(value.current)
    && hasMetricUnits(value.units) && isSourceAttribution(value.source);
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

function hasMetricUnits(units: unknown): boolean {
  if (!isRecord(units)) return false;
  return units.temperature === '°C' && units.apparentTemperature === '°C'
    && units.humidity === '%' && units.windSpeed === 'km/h';
}

export async function fetchWeather(locationId: number, signal: AbortSignal): Promise<WeatherResponse> {
  const reply = await getJson('/weather', { locationId: String(locationId) }, signal);
  if (!reply.ok) throw ERRORS[readApiErrorCode(reply.payload, ERRORS) ?? 'WEATHER_PROVIDER_UNAVAILABLE'];
  if (!isWeatherResponse(reply.payload)) throw UNAVAILABLE_ERROR;
  return reply.payload;
}
