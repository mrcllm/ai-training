import { AppError } from '../errors/app-error';
import { logger } from '../observability/logger';
import type { WeatherProvider } from '../types/weather-provider';
import type { WeatherResponse } from '../types/weather-response';

type GetCurrentWeatherDependencies = {
  provider: WeatherProvider;
  timeoutMs?: number;
  signal?: AbortSignal;
  now?: () => number;
};

const DEFAULT_TIMEOUT_MS = 2500;
const SOURCE_URL = 'https://open-meteo.com/';

function providerError(): AppError {
  return new AppError(503, 'WEATHER_PROVIDER_UNAVAILABLE', 'O serviço de clima está temporariamente indisponível.');
}

function logStep(event: 'open_meteo_request_completed' | 'open_meteo_request_failed', stage: string, startedAt: number, now: () => number): void {
  const context = { stage, durationMs: Math.max(0, now() - startedAt) };
  if (event === 'open_meteo_request_failed') logger.warn(event, { ...context, outcome: 'failed' });
  else logger.info(event, { ...context, outcome: 'success' });
}

function linkAbortSignal(source: AbortSignal | undefined, controller: AbortController): () => void {
  if (source === undefined) return () => undefined;
  if (source.aborted) controller.abort(source.reason);
  const abort = (): void => controller.abort(source.reason);
  source.addEventListener('abort', abort, { once: true });
  return () => source.removeEventListener('abort', abort);
}

export async function getCurrentWeather(city: string, dependencies: GetCurrentWeatherDependencies): Promise<WeatherResponse> {
  const now = dependencies.now ?? Date.now;
  const controller = new AbortController();
  const startedAt = now();
  let stage = 'geocoding';
  let stageStartedAt = startedAt;
  const unlinkSignal = linkAbortSignal(dependencies.signal, controller);
  const timeout = setTimeout(() => {
    controller.abort();
  }, dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const locations = await dependencies.provider.findLocations(city, controller.signal);
    logStep('open_meteo_request_completed', stage, stageStartedAt, now);
    if (locations.length === 0) {
      logger.warn('open_meteo_request_failed', { stage, durationMs: Math.max(0, now() - stageStartedAt), outcome: 'city_not_found' });
      throw new AppError(404, 'CITY_NOT_FOUND', 'Cidade não encontrada. Revise o nome e tente novamente.');
    }
    stage = 'forecast';
    stageStartedAt = now();
    const conditions = await dependencies.provider.getCurrentConditions(locations[0], controller.signal);
    logStep('open_meteo_request_completed', stage, stageStartedAt, now);
    return {
      location: { name: locations[0].name, admin1: locations[0].admin1, country: locations[0].country },
      ...conditions,
      source: { name: 'Open-Meteo', url: SOURCE_URL },
    };
  } catch (error: unknown) {
    if (error instanceof AppError && error.code === 'CITY_NOT_FOUND') throw error;
    logStep('open_meteo_request_failed', stage, stageStartedAt, now);
    throw providerError();
  } finally {
    clearTimeout(timeout);
    unlinkSignal();
  }
}
