import { AppError } from '../errors/app-error';
import { locationProviderAborted, unexpectedLocationProviderFailure } from '../errors/provider-unavailable';
import { logProviderStep } from './log-provider-step';
import { createRequestScope } from './request-scope';
import type { LocationSuggestion } from '../types/location-suggestion';
import type { LocationSuggestionsResponse } from '../types/location-suggestions-response';
import type { WeatherProvider } from '../types/weather-provider';

type SearchLocationsDependencies = {
  provider: WeatherProvider;
  timeoutMs: number;
  signal?: AbortSignal;
  now?: () => number;
  requestId?: string;
};

const SOURCE = { name: 'Open-Meteo' as const, url: 'https://open-meteo.com/' as const };
const MAX_SUGGESTIONS = 8;

function toSuggestion(location: Awaited<ReturnType<WeatherProvider['searchLocations']>>[number]): LocationSuggestion {
  return { id: location.id, name: location.name, admin1: location.admin1, country: location.country };
}

function normalizeFailure(error: unknown, aborted: boolean): AppError {
  if (error instanceof AppError && error.code === 'LOCATION_PROVIDER_UNAVAILABLE') return error;
  if (aborted) return locationProviderAborted('Busca de localidades cancelada');
  return unexpectedLocationProviderFailure('Falha inesperada ao buscar localidades');
}

export async function searchLocations(query: string, dependencies: SearchLocationsDependencies): Promise<LocationSuggestionsResponse> {
  const now = dependencies.now ?? Date.now;
  const startedAt = now();
  const scope = createRequestScope(dependencies.signal, dependencies.timeoutMs);
  try {
    const locations = await dependencies.provider.searchLocations(query, scope.signal);
    const suggestions = locations.filter((location) => location.countryCode === 'BR').slice(0, MAX_SUGGESTIONS).map(toSuggestion);
    logProviderStep({ status: 'success', stage: 'location_search', startedAt, now, requestId: dependencies.requestId });
    return { suggestions, source: SOURCE };
  } catch (error: unknown) {
    const failure = normalizeFailure(error, scope.signal.aborted);
    logProviderStep({
      status: 'failed', stage: 'location_search', startedAt, now,
      level: failure.logLevel, outcome: failure.outcome, requestId: dependencies.requestId,
    });
    throw failure;
  } finally {
    scope.close();
  }
}
