import { AppError } from '../errors/app-error';
import { unexpectedWeatherProviderFailure, weatherProviderAborted } from '../errors/provider-unavailable';
import { logProviderStep } from './log-provider-step';
import { createRequestScope } from './request-scope';
import type { ResolvedLocation } from '../types/resolved-location';
import type { WeatherProvider } from '../types/weather-provider';
import type { WeatherResponse } from '../types/weather-response';

type GetCurrentWeatherDependencies = {
  provider: WeatherProvider;
  timeoutMs?: number;
  signal?: AbortSignal;
  now?: () => number;
  requestId?: string;
};

type ProviderStage = 'location_lookup' | 'forecast';
const DEFAULT_TIMEOUT_MS = 2500;
const SOURCE = { name: 'Open-Meteo' as const, url: 'https://open-meteo.com/' as const };
const NOT_FOUND_STATUS = 404;

function locationNotFound(): AppError {
  return new AppError({
    statusCode: NOT_FOUND_STATUS,
    code: 'LOCATION_NOT_FOUND',
    publicMessage: 'A localidade selecionada não está mais disponível. Selecione-a novamente.',
    outcome: 'location_not_found',
  });
}

function requireLocation(location: ResolvedLocation | null): ResolvedLocation {
  if (location === null) throw locationNotFound();
  return location;
}

function normalizeFailure(error: unknown, aborted: boolean): AppError {
  if (error instanceof AppError
    && (error.code === 'LOCATION_NOT_FOUND' || error.code === 'WEATHER_PROVIDER_UNAVAILABLE')) return error;
  if (aborted) return weatherProviderAborted('Consulta meteorológica cancelada');
  return unexpectedWeatherProviderFailure('Falha inesperada ao consultar a Open-Meteo');
}

export async function getCurrentWeather(locationId: number, dependencies: GetCurrentWeatherDependencies): Promise<WeatherResponse> {
  const now = dependencies.now ?? Date.now;
  const scope = createRequestScope(dependencies.signal, dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let stage: ProviderStage = 'location_lookup';
  let startedAt = now();
  try {
    const location = requireLocation(await dependencies.provider.getLocation(locationId, scope.signal));
    logProviderStep({ status: 'success', stage, startedAt, now, requestId: dependencies.requestId });
    stage = 'forecast';
    startedAt = now();
    const conditions = await dependencies.provider.getCurrentConditions(location, scope.signal);
    logProviderStep({ status: 'success', stage, startedAt, now, requestId: dependencies.requestId });
    return { location: { name: location.name, admin1: location.admin1, country: location.country }, ...conditions, source: SOURCE };
  } catch (error: unknown) {
    const failure = normalizeFailure(error, scope.signal.aborted);
    logProviderStep({
      status: 'failed', stage, startedAt, now,
      level: failure.logLevel, outcome: failure.outcome, requestId: dependencies.requestId,
    });
    throw failure;
  } finally {
    scope.close();
  }
}
