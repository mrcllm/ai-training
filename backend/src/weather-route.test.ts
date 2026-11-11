import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { loadEnvironment } from './config/environment';
import { logger } from './observability/logger';
import type { WeatherProvider } from './types/weather-provider';

const environment = loadEnvironment({});
const location = { name: 'Lisboa', admin1: 'Lisboa', country: 'Portugal', latitude: 38.7, longitude: -9.1 };
const conditions = {
  current: { temperature: 18.4, apparentTemperature: 17.9, condition: { code: 2, label: 'Parcialmente nublado' }, humidity: 72, windSpeed: 14.2 },
  units: { temperature: '°C' as const, apparentTemperature: '°C' as const, humidity: '%' as const, windSpeed: 'km/h' as const },
};

function makeProvider(): WeatherProvider {
  return {
    findLocations: vi.fn(async () => [location]),
    getCurrentConditions: vi.fn(async () => conditions),
  };
}

afterEach(() => vi.restoreAllMocks());

describe('GET /weather', () => {
  it('retorna o contrato normalizado com headers de cache e request ID', async () => {
    const provider = makeProvider();
    const response = await request(createApp(environment, { weatherProvider: provider }))
      .get('/weather?city=Lisboa').set('X-Request-Id', 'weather-123');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-request-id']).toBe('weather-123');
    expect(response.body).toEqual({
      location: { name: 'Lisboa', admin1: 'Lisboa', country: 'Portugal' },
      ...conditions,
      source: { name: 'Open-Meteo', url: 'https://open-meteo.com/' },
    });
    expect(provider.findLocations).toHaveBeenCalledWith('Lisboa', expect.any(AbortSignal));
  });

  it.each(['/weather', '/weather?city=A', '/weather?city=A&city=B'])('rejeita query inválida sem consultar o provedor: %s', async (path) => {
    const provider = makeProvider();
    const response = await request(createApp(environment, { weatherProvider: provider })).get(path);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_CITY');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(provider.findLocations).not.toHaveBeenCalled();
  });

  it('retorna 404 para cidade sem correspondências', async () => {
    const provider = makeProvider();
    vi.mocked(provider.findLocations).mockResolvedValue([]);
    const response = await request(createApp(environment, { weatherProvider: provider })).get('/weather?city=Atlantida');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('CITY_NOT_FOUND');
    expect(provider.getCurrentConditions).not.toHaveBeenCalled();
  });

  it('converte falha do provedor em 503 sem revelar detalhes internos', async () => {
    const provider = makeProvider();
    vi.mocked(provider.findLocations).mockRejectedValue(new Error('provider secret detail'));
    const response = await request(createApp(environment, { weatherProvider: provider })).get('/weather?city=Lisboa');
    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('WEATHER_PROVIDER_UNAVAILABLE');
    expect(JSON.stringify(response.body)).not.toContain('provider secret detail');
  });

  it('oculta falhas internas inesperadas com envelope 500 estável', async () => {
    const provider = makeProvider();
    vi.spyOn(logger, 'info').mockImplementation((event) => {
      if (event === 'weather_request_completed') throw new Error('internal detail');
    });
    const response = await request(createApp(environment, { weatherProvider: provider })).get('/weather?city=Lisboa');
    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(response.body)).not.toContain('internal detail');
  });

  it('mantém health independente e aplica request ID e CORS', async () => {
    const provider = makeProvider();
    const response = await request(createApp(environment, { weatherProvider: provider }))
      .get('/health').set('Origin', environment.frontendOrigin);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.headers['x-request-id']).toBeTruthy();
    expect(response.headers['access-control-allow-origin']).toBe(environment.frontendOrigin);
    expect(provider.findLocations).not.toHaveBeenCalled();
  });
});
