import { getJson, isRecord, isSourceAttribution, readApiErrorCode } from './api-client';
import type { LocationSuggestion } from '../types/location-suggestion';
import type { LocationSuggestionsResponse } from '../types/location-suggestions-response';
import type { UiLocationError } from '../types/ui-location-error';

const MAX_SUGGESTIONS = 8;
const UNAVAILABLE_ERROR: UiLocationError = {
  kind: 'unavailable',
  message: 'Não foi possível buscar localidades agora. Tente novamente.',
};
const ERRORS = {
  INVALID_LOCATION_QUERY: { kind: 'validation', message: 'Digite de 2 a 100 caracteres para buscar uma localidade.' },
  LOCATION_PROVIDER_UNAVAILABLE: UNAVAILABLE_ERROR,
} satisfies Record<string, UiLocationError>;

function isOptionalText(value: unknown): boolean {
  return value === null || typeof value === 'string';
}

function isLocationSuggestion(value: unknown): value is LocationSuggestion {
  if (!isRecord(value)) return false;
  return Number.isSafeInteger(value.id) && Number(value.id) > 0
    && typeof value.name === 'string' && value.name.trim() !== ''
    && isOptionalText(value.admin1) && isOptionalText(value.country);
}

function isSuggestionsResponse(value: unknown): value is LocationSuggestionsResponse {
  if (!isRecord(value) || !Array.isArray(value.suggestions)) return false;
  return value.suggestions.length <= MAX_SUGGESTIONS
    && value.suggestions.every(isLocationSuggestion)
    && isSourceAttribution(value.source);
}

export function isUiLocationError(value: unknown): value is UiLocationError {
  return isRecord(value) && (value.kind === 'validation' || value.kind === 'unavailable')
    && typeof value.message === 'string';
}

export async function fetchLocationSuggestions(query: string, signal: AbortSignal): Promise<LocationSuggestionsResponse> {
  const reply = await getJson('/locations', { query }, signal).catch((error: unknown) => {
    if (signal.aborted) throw error;
    throw UNAVAILABLE_ERROR;
  });
  if (!reply.ok) throw ERRORS[readApiErrorCode(reply.payload, ERRORS) ?? 'LOCATION_PROVIDER_UNAVAILABLE'];
  if (!isSuggestionsResponse(reply.payload)) throw UNAVAILABLE_ERROR;
  return reply.payload;
}
