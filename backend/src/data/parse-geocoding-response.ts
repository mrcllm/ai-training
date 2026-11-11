import { AppError } from '../errors/app-error';
import type { ResolvedLocation } from '../types/resolved-location';

type UnknownRecord = Record<string, unknown>;
const SPACES = /\s+/gu;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCoordinate(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function optionalName(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw invalidPayload('Campo de localidade inválido');
  const name = value.normalize('NFC').trim().replace(SPACES, ' ');
  return name === '' ? null : name;
}

function invalidPayload(message: string): AppError {
  return new AppError(503, 'WEATHER_PROVIDER_UNAVAILABLE', 'O serviço de clima está temporariamente indisponível.', message);
}

function parseLocation(value: unknown): ResolvedLocation {
  if (!isRecord(value) || typeof value.name !== 'string' || value.name.trim() === '') {
    throw invalidPayload('Localidade inválida na resposta de geocodificação');
  }
  if (!isCoordinate(value.latitude, -90, 90) || !isCoordinate(value.longitude, -180, 180)) {
    throw invalidPayload('Coordenadas inválidas na resposta de geocodificação');
  }
  return {
    name: value.name.normalize('NFC').trim().replace(SPACES, ' '),
    admin1: optionalName(value.admin1),
    country: optionalName(value.country),
    latitude: value.latitude,
    longitude: value.longitude,
  };
}

export function parseGeocodingResponse(payload: unknown): ResolvedLocation[] {
  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    throw invalidPayload('Resposta de geocodificação inválida');
  }
  if (payload.results.length === 0) return [];
  return [parseLocation(payload.results[0])];
}
