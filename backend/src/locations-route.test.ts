import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { loadEnvironment } from './config/environment';
import { logger } from './observability/logger';
import type { ResolvedLocation } from './types/resolved-location';
import type { WeatherProvider } from './types/weather-provider';

const environment = loadEnvironment({});
const location: ResolvedLocation = {
  id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', latitude: -23.5, longitude: -46.6,
};

function makeProvider(): WeatherProvider {
  return { searchLocations: vi.fn().mockResolvedValue([location]), getLocation: vi.fn(), getCurrentConditions: vi.fn() };
}

afterEach(() => vi.restoreAllMocks());

describe('GET /locations', () => {
  it('entrega sugestões, atribuição e middleware global', async () => {
    const provider = makeProvider();
    const response = await request(createApp(environment, { weatherProvider: provider }))
      .get('/locations?query=Sao').set('Origin', environment.frontendOrigin).set('X-Request-Id', 'locations-123');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      suggestions: [{ id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil' }],
      source: { name: 'Open-Meteo', url: 'https://open-meteo.com/' },
    });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-request-id']).toBe('locations-123');
    expect(response.headers['access-control-allow-origin']).toBe(environment.frontendOrigin);
    expect(provider.searchLocations).toHaveBeenCalledWith('Sao', expect.any(AbortSignal));
  });

  it('retorna lista vazia como sucesso', async () => {
    const provider = makeProvider();
    const warning = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    vi.mocked(provider.searchLocations).mockResolvedValue([]);
    const response = await request(createApp(environment, { weatherProvider: provider })).get('/locations?query=Nada');
    expect(response.status).toBe(200);
    expect(response.body.suggestions).toEqual([]);
    expect(warning).toHaveBeenCalledWith(
      'locations_request_completed', expect.objectContaining({ outcome: 'empty', resultCount: 0 }),
    );
  });

  it.each(['/locations', '/locations?query=A', '/locations?query=A&query=B'])(
    'rejeita query inválida sem chamar o provedor: %s',
    async (path) => {
      const provider = makeProvider();
      const response = await request(createApp(environment, { weatherProvider: provider })).get(path);
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_LOCATION_QUERY');
      expect(provider.searchLocations).not.toHaveBeenCalled();
    },
  );

  it('isola falha externa em envelope 503', async () => {
    const provider = makeProvider();
    vi.mocked(provider.searchLocations).mockRejectedValue(new Error('private provider detail'));
    const response = await request(createApp(environment, { weatherProvider: provider })).get('/locations?query=Recife');
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('LOCATION_PROVIDER_UNAVAILABLE');
    expect(JSON.stringify(response.body)).not.toContain('private provider detail');
  });

  it('aborta a busca externa quando o cliente fecha a conexão HTTP', async () => {
    const provider = makeProvider();
    const aborted = new Promise<void>((resolve) => {
      vi.mocked(provider.searchLocations).mockImplementation((_query, signal) => new Promise((_success, reject) => {
        signal.addEventListener('abort', () => {
          resolve();
          reject(new Error('aborted'));
        }, { once: true });
      }));
    });
    const pendingRequest = request(createApp(environment, { weatherProvider: provider })).get('/locations?query=Recife');
    const completion = pendingRequest.then(() => undefined, () => undefined);
    await vi.waitFor(() => expect(provider.searchLocations).toHaveBeenCalledOnce());
    pendingRequest.abort();
    await expect(aborted).resolves.toBeUndefined();
    await completion;
  });
});
