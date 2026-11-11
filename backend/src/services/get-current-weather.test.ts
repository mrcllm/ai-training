import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../observability/logger';
import type { ProviderConditions } from '../types/provider-conditions';
import type { ResolvedLocation } from '../types/resolved-location';
import type { WeatherProvider } from '../types/weather-provider';
import { getCurrentWeather } from './get-current-weather';

const location = { name: 'Lisboa', admin1: 'Lisboa', country: 'Portugal', latitude: 38.7, longitude: -9.1 };
const conditions = {
  current: { temperature: 18, apparentTemperature: 17, condition: { code: 2, label: 'Parcialmente nublado' }, humidity: 72, windSpeed: 14 },
  units: { temperature: '°C' as const, apparentTemperature: '°C' as const, humidity: '%' as const, windSpeed: 'km/h' as const },
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('getCurrentWeather', () => {
  it('uses the first geocoding result and passes its coordinates to the forecast', async () => {
    const provider: WeatherProvider = {
      findLocations: vi.fn().mockResolvedValue([location, { ...location, name: 'Lisboa 2' }]),
      getCurrentConditions: vi.fn().mockResolvedValue(conditions),
    };
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(125).mockReturnValueOnce(150);
    const result = await getCurrentWeather('Lisboa', { provider, now });
    expect(provider.getCurrentConditions).toHaveBeenCalledWith(location, expect.any(AbortSignal));
    expect(result).toEqual({ location: { name: 'Lisboa', admin1: 'Lisboa', country: 'Portugal' }, ...conditions, source: { name: 'Open-Meteo', url: 'https://open-meteo.com/' } });
  });

  it('maps provider failures to a stable unavailable error without retry', async () => {
    const provider: WeatherProvider = {
      findLocations: vi.fn().mockRejectedValue(new Error('private provider detail')),
      getCurrentConditions: vi.fn(),
    };
    vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    await expect(getCurrentWeather('Lisboa', { provider })).rejects.toMatchObject({ statusCode: 503, code: 'WEATHER_PROVIDER_UNAVAILABLE' });
    expect(provider.findLocations).toHaveBeenCalledTimes(1);
    expect(provider.getCurrentConditions).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith('open_meteo_request_failed', expect.objectContaining({ stage: 'geocoding', outcome: 'failed' }));
  });

  it('shares one deadline across the sequential provider calls', async () => {
    vi.useFakeTimers();
    const provider: WeatherProvider = {
      findLocations: vi.fn().mockResolvedValue([location]),
      getCurrentConditions: vi.fn((_coordinates: { latitude: number; longitude: number }, signal: AbortSignal) => new Promise<ProviderConditions>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      })),
    };
    const result = getCurrentWeather('Lisboa', { provider, timeoutMs: 50 });
    const rejection = expect(result).rejects.toMatchObject({ statusCode: 503, code: 'WEATHER_PROVIDER_UNAVAILABLE' });
    await vi.advanceTimersByTimeAsync(50);
    await rejection;
    expect(provider.findLocations).toHaveBeenCalledTimes(1);
    expect(provider.getCurrentConditions).toHaveBeenCalledTimes(1);
  });

  it('returns city not found only for an empty valid geocoding result', async () => {
    const provider: WeatherProvider = { findLocations: vi.fn().mockResolvedValue([]), getCurrentConditions: vi.fn() };
    await expect(getCurrentWeather('Cidade', { provider })).rejects.toMatchObject({ statusCode: 404, code: 'CITY_NOT_FOUND' });
    expect(provider.getCurrentConditions).not.toHaveBeenCalled();
  });

  it('propagates caller cancellation to the active provider request', async () => {
    const externalSignal = new AbortController();
    const provider: WeatherProvider = {
      findLocations: vi.fn((_city: string, signal: AbortSignal) => new Promise<ResolvedLocation[]>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      })),
      getCurrentConditions: vi.fn(),
    };
    const result = getCurrentWeather('Lisboa', { provider, signal: externalSignal.signal });
    externalSignal.abort();
    await expect(result).rejects.toMatchObject({ statusCode: 503, code: 'WEATHER_PROVIDER_UNAVAILABLE' });
    expect(provider.getCurrentConditions).not.toHaveBeenCalled();
  });
});
