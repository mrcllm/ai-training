import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../observability/logger';
import type { ProviderConditions } from '../types/provider-conditions';
import type { ResolvedLocation } from '../types/resolved-location';
import type { WeatherProvider } from '../types/weather-provider';
import { getCurrentWeather } from './get-current-weather';

const location: ResolvedLocation = {
  id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', countryCode: 'BR', latitude: -23.5, longitude: -46.6,
};
const conditions: ProviderConditions = {
  current: { temperature: 18, apparentTemperature: 17, condition: { code: 2, label: 'Parcialmente nublado' }, humidity: 72, windSpeed: 14 },
  units: { temperature: '°C', apparentTemperature: '°C', humidity: '%', windSpeed: 'km/h' },
};

function makeProvider(): WeatherProvider {
  return { searchLocations: vi.fn(), getLocation: vi.fn().mockResolvedValue(location), getCurrentConditions: vi.fn().mockResolvedValue(conditions) };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('getCurrentWeather', () => {
  it('resolve exatamente o ID e consulta suas coordenadas', async () => {
    const provider = makeProvider();
    const completed = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    const result = await getCurrentWeather(3448439, { provider, requestId: 'request-2' });
    expect(provider.getLocation).toHaveBeenCalledWith(3448439, expect.any(AbortSignal));
    expect(provider.getCurrentConditions).toHaveBeenCalledWith(location, expect.any(AbortSignal));
    expect(result.location).toEqual({ name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil' });
    expect(completed).toHaveBeenCalledWith(
      'open_meteo_request_completed', expect.objectContaining({ requestId: 'request-2', stage: 'location_lookup' }),
    );
  });

  it.each([null, { ...location, countryCode: 'US' }])('recusa localidade ausente ou estrangeira', async (resolved) => {
    const provider = makeProvider();
    vi.mocked(provider.getLocation).mockResolvedValue(resolved);
    await expect(getCurrentWeather(3448439, { provider })).rejects.toMatchObject({ statusCode: 404, code: 'LOCATION_NOT_FOUND' });
    expect(provider.getCurrentConditions).not.toHaveBeenCalled();
  });

  it('mapeia falha inesperada sem retry', async () => {
    const provider = makeProvider();
    vi.mocked(provider.getLocation).mockRejectedValue(new Error('private detail'));
    await expect(getCurrentWeather(3448439, { provider })).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' });
    expect(provider.getLocation).toHaveBeenCalledTimes(1);
    expect(provider.getCurrentConditions).not.toHaveBeenCalled();
  });

  it('compartilha um deadline entre lookup e forecast', async () => {
    vi.useFakeTimers();
    const provider = makeProvider();
    vi.mocked(provider.getCurrentConditions).mockImplementation((_coordinates, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }));
    const result = getCurrentWeather(3448439, { provider, timeoutMs: 50 });
    const rejection = expect(result).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' });
    await vi.advanceTimersByTimeAsync(50);
    await rejection;
    expect(provider.getLocation).toHaveBeenCalledTimes(1);
    expect(provider.getCurrentConditions).toHaveBeenCalledTimes(1);
  });

  it('propaga o cancelamento do chamador', async () => {
    const controller = new AbortController();
    const provider = makeProvider();
    vi.mocked(provider.getLocation).mockImplementation((_id, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }));
    const result = getCurrentWeather(3448439, { provider, signal: controller.signal });
    controller.abort();
    await expect(result).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' });
  });
});
