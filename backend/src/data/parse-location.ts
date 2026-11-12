import type { AppError } from '../errors/app-error';
import type { ResolvedLocation } from '../types/resolved-location';

type UnknownRecord = Record<string, unknown>;
type InvalidPayload = (message: string) => AppError;
const MAX_LOCATION_ID = 2_147_483_647;
const SPACES = /\s+/gu;
const LATITUDE_BOUNDS = { minimum: -90, maximum: 90 };
const LONGITUDE_BOUNDS = { minimum: -180, maximum: 180 };

type CoordinateBounds = {
  minimum: number;
  maximum: number;
};

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredName(value: unknown, field: string, invalid: InvalidPayload): string {
  if (typeof value !== 'string') throw invalid(`Campo obrigatório inválido: ${field}`);
  const normalized = value.normalize('NFC').trim().replace(SPACES, ' ');
  if (normalized === '') throw invalid(`Campo obrigatório vazio: ${field}`);
  return normalized;
}

function optionalName(value: unknown, field: string, invalid: InvalidPayload): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw invalid(`Campo opcional inválido: ${field}`);
  const normalized = value.normalize('NFC').trim().replace(SPACES, ' ');
  return normalized === '' ? null : normalized;
}

function coordinate(value: unknown, bounds: CoordinateBounds, invalid: InvalidPayload): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < bounds.minimum || value > bounds.maximum) {
    throw invalid('Coordenadas inválidas na resposta de geocodificação');
  }
  return value;
}

export function parseLocation(value: unknown, invalid: InvalidPayload): ResolvedLocation {
  if (!isRecord(value)) throw invalid('Localidade inválida na resposta de geocodificação');
  if (!Number.isInteger(value.id) || Number(value.id) <= 0 || Number(value.id) > MAX_LOCATION_ID) {
    throw invalid('Identificador inválido na resposta de geocodificação');
  }
  return {
    id: Number(value.id),
    name: requiredName(value.name, 'name', invalid),
    admin1: optionalName(value.admin1, 'admin1', invalid),
    country: optionalName(value.country, 'country', invalid),
    latitude: coordinate(value.latitude, LATITUDE_BOUNDS, invalid),
    longitude: coordinate(value.longitude, LONGITUDE_BOUNDS, invalid),
  };
}
