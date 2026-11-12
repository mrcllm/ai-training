import { parseLocation } from './parse-location';
import { invalidWeatherProviderPayload } from '../errors/provider-unavailable';
import type { ResolvedLocation } from '../types/resolved-location';

export function parseLocationResponse(payload: unknown): ResolvedLocation {
  return parseLocation(payload, invalidWeatherProviderPayload);
}
