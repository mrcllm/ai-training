import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../observability/logger';
import type { ResolvedLocation } from '../types/resolved-location';
import type { WeatherProvider } from '../types/weather-provider';
import { searchLocations } from './search-locations';

const location: ResolvedLocation = {
  id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', latitude: -23.5, longitude: -46.6,
};

function makeProvider(): WeatherProvider {
  return { searchLocations: vi.fn().mockResolvedValue([location]), getLocation: vi.fn(), getCurrentConditions: vi.fn() };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('searchLocations', () => {
  it('mapeia até oito localidades e a atribuição', async () => {
    const provider = makeProvider();
    const completed = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    vi.mocked(provider.searchLocations).mockResolvedValue([
      location, ...Array.from({ length: 9 }, (_, index) => ({ ...location, id: index + 10 })),
    ]);
    const result = await searchLocations('Sao', { provider, timeoutMs: 600, requestId: 'request-1' });
    expect(result.suggestions).toHaveLength(8);
    expect(result.suggestions[0]).toEqual({ id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil' });
    expect(result.source.name).toBe('Open-Meteo');
    expect(completed).toHaveBeenCalledWith(
      'open_meteo_request_completed', expect.objectContaining({ requestId: 'request-1', stage: 'location_search' }),
    );
  });

  it('mantém localidades de outros países na ordem da origem', async () => {
    const provider = makeProvider();
    const paris = { ...location, id: 2988507, name: 'Paris', admin1: 'Île-de-France', country: 'França' };
    vi.mocked(provider.searchLocations).mockResolvedValue([paris, location]);
    const result = await searchLocations('Par', { provider, timeoutMs: 600 });
    expect(result.suggestions).toEqual([
      { id: 2988507, name: 'Paris', admin1: 'Île-de-France', country: 'França' },
      { id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil' },
    ]);
  });

  it('preserva lista vazia como sucesso', async () => {
    const provider = makeProvider();
    vi.mocked(provider.searchLocations).mockResolvedValue([]);
    await expect(searchLocations('Nada', { provider, timeoutMs: 600 })).resolves.toMatchObject({ suggestions: [] });
  });

  it('aplica deadline e não faz retry', async () => {
    vi.useFakeTimers();
    const provider = makeProvider();
    vi.mocked(provider.searchLocations).mockImplementation((_query, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }));
    const result = searchLocations('Lento', { provider, timeoutMs: 50 });
    const rejection = expect(result).rejects.toMatchObject({ code: 'LOCATION_PROVIDER_UNAVAILABLE' });
    await vi.advanceTimersByTimeAsync(50);
    await rejection;
    expect(provider.searchLocations).toHaveBeenCalledTimes(1);
  });

  it('propaga cancelamento e registra falha sem conteúdo da query', async () => {
    const controller = new AbortController();
    const provider = makeProvider();
    vi.mocked(provider.searchLocations).mockImplementation((_query, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }));
    const warning = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const result = searchLocations('Segredo', { provider, timeoutMs: 600, signal: controller.signal });
    controller.abort();
    await expect(result).rejects.toMatchObject({ code: 'LOCATION_PROVIDER_UNAVAILABLE' });
    expect(JSON.stringify(warning.mock.calls)).not.toContain('Segredo');
  });
});
