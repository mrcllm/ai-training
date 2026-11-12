import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { loadEnvironment } from './config/environment';
import { logger } from './observability/logger';
import type { ResolvedLocation } from './types/resolved-location';
import type { WeatherProvider } from './types/weather-provider';

const environment = loadEnvironment({});
const location: ResolvedLocation = {
  id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', countryCode: 'BR', latitude: -23.5, longitude: -46.6,
};
const conditions = {
  current: { temperature: 18.4, apparentTemperature: 17.9, condition: { code: 2, label: 'Parcialmente nublado' }, humidity: 72, windSpeed: 14.2 },
  units: { temperature: '°C' as const, apparentTemperature: '°C' as const, humidity: '%' as const, windSpeed: 'km/h' as const },
};

function makeProvider(): WeatherProvider {
  return { searchLocations: vi.fn(), getLocation: vi.fn().mockResolvedValue(location), getCurrentConditions: vi.fn().mockResolvedValue(conditions) };
}

afterEach(() => vi.restoreAllMocks());

describe('GET /weather', () => {
  it('consulta exatamente o ID e retorna o contrato normalizado', async () => {
    const provider = makeProvider();
    const response = await request(createApp(environment, { weatherProvider: provider }))
      .get('/weather?locationId=3448439').set('X-Request-Id', 'weather-123');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-request-id']).toBe('weather-123');
    expect(response.body).toEqual({
      location: { name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil' },
      ...conditions, source: { name: 'Open-Meteo', url: 'https://open-meteo.com/' },
    });
    expect(provider.getLocation).toHaveBeenCalledWith(3448439, expect.any(AbortSignal));
    expect(provider.searchLocations).not.toHaveBeenCalled();
  });

  it.each(['/weather', '/weather?locationId=abc', '/weather?locationId=1&locationId=2', '/weather?city=Recife'])(
    'rejeita ID inválido sem consultar o provedor: %s',
    async (path) => {
      const provider = makeProvider();
      const response = await request(createApp(environment, { weatherProvider: provider })).get(path);
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_LOCATION_ID');
      expect(provider.getLocation).not.toHaveBeenCalled();
    },
  );

  it.each([null, { ...location, countryCode: 'US' }])('retorna 404 para localidade ausente ou estrangeira', async (resolved) => {
    const provider = makeProvider();
    vi.mocked(provider.getLocation).mockResolvedValue(resolved);
    const response = await request(createApp(environment, { weatherProvider: provider })).get('/weather?locationId=3448439');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('LOCATION_NOT_FOUND');
    expect(provider.getCurrentConditions).not.toHaveBeenCalled();
  });

  it('converte falha do provedor em 503 sem detalhes internos', async () => {
    const provider = makeProvider();
    vi.mocked(provider.getLocation).mockRejectedValue(new Error('provider secret detail'));
    const response = await request(createApp(environment, { weatherProvider: provider })).get('/weather?locationId=3448439');
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('WEATHER_PROVIDER_UNAVAILABLE');
    expect(JSON.stringify(response.body)).not.toContain('provider secret detail');
  });

  it('oculta falhas internas inesperadas com envelope 500 estável', async () => {
    const provider = makeProvider();
    vi.spyOn(logger, 'info').mockImplementation((event) => {
      if (event === 'weather_request_completed') throw new Error('internal detail');
    });
    const response = await request(createApp(environment, { weatherProvider: provider })).get('/weather?locationId=3448439');
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('aborta o lookup externo quando o cliente fecha a conexão HTTP', async () => {
    const provider = makeProvider();
    const aborted = new Promise<void>((resolve) => {
      vi.mocked(provider.getLocation).mockImplementation((_locationId, signal) => new Promise((_success, reject) => {
        signal.addEventListener('abort', () => {
          resolve();
          reject(new Error('aborted'));
        }, { once: true });
      }));
    });
    const pendingRequest = request(createApp(environment, { weatherProvider: provider })).get('/weather?locationId=3448439');
    const completion = pendingRequest.then(() => undefined, () => undefined);
    await vi.waitFor(() => expect(provider.getLocation).toHaveBeenCalledOnce());
    pendingRequest.abort();
    await expect(aborted).resolves.toBeUndefined();
    await completion;
  });
});
