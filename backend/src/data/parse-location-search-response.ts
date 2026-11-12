import { invalidLocationProviderPayload } from '../errors/provider-unavailable';
import { isRecord, parseLocation } from './parse-location';
import type { ResolvedLocation } from '../types/resolved-location';

const MAX_RESULTS = 8;
const BRAZIL_CODE = 'BR';

function parseBrazilianLocation(value: unknown): ResolvedLocation | null {
  if (!isRecord(value) || typeof value.country_code !== 'string') {
    throw invalidLocationProviderPayload('Código de país inválido na resposta de geocodificação');
  }
  if (value.country_code !== BRAZIL_CODE) return null;
  return parseLocation(value, invalidLocationProviderPayload);
}

export function parseLocationSearchResponse(payload: unknown): ResolvedLocation[] {
  if (!isRecord(payload)) throw invalidLocationProviderPayload('Resposta de geocodificação inválida');
  if (payload.results === undefined) return [];
  if (!Array.isArray(payload.results)) throw invalidLocationProviderPayload('Resultados de geocodificação inválidos');
  return payload.results.slice(0, MAX_RESULTS)
    .map(parseBrazilianLocation)
    .filter((location): location is ResolvedLocation => location !== null);
}
