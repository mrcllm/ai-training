import { invalidLocationProviderPayload } from '../errors/provider-unavailable';
import { isRecord, parseLocation } from './parse-location';
import type { ResolvedLocation } from '../types/resolved-location';

const MAX_RESULTS = 8;

function parseSearchResult(value: unknown): ResolvedLocation {
  return parseLocation(value, invalidLocationProviderPayload);
}

export function parseLocationSearchResponse(payload: unknown): ResolvedLocation[] {
  if (!isRecord(payload)) throw invalidLocationProviderPayload('Resposta de geocodificação inválida');
  if (payload.results === undefined) return [];
  if (!Array.isArray(payload.results)) throw invalidLocationProviderPayload('Resultados de geocodificação inválidos');
  return payload.results.slice(0, MAX_RESULTS).map(parseSearchResult);
}
