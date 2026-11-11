import { describe, expect, it } from 'vitest';
import { loadEnvironment } from './environment';

describe('loadEnvironment', () => {
  it('usa padrões oficiais e configurações locais', () => {
    expect(loadEnvironment({})).toEqual({
      port: 3001,
      frontendOrigin: 'http://localhost:3000',
      geocodingUrl: 'https://geocoding-api.open-meteo.com/v1/search',
      forecastUrl: 'https://api.open-meteo.com/v1/forecast',
      weatherTimeoutMs: 2500,
      shutdownTimeoutMs: 10000,
    });
  });

  it('lê configurações válidas do ambiente', () => {
    expect(loadEnvironment({ PORT: '3100', FRONTEND_ORIGIN: 'https://painel.example', OPEN_METEO_TIMEOUT_MS: '1200' })).toMatchObject({
      port: 3100,
      frontendOrigin: 'https://painel.example',
      weatherTimeoutMs: 1200,
    });
  });

  it('rejeita caminhos em FRONTEND_ORIGIN', () => {
    expect(() => loadEnvironment({ FRONTEND_ORIGIN: 'https://painel.example/app' })).toThrow('somente uma origem');
  });

  it.each([
    [{ PORT: 'abc' }, 'PORT'],
    [{ PORT: '65536' }, '65535'],
    [{ OPEN_METEO_TIMEOUT_MS: '0' }, 'OPEN_METEO_TIMEOUT_MS'],
    [{ OPEN_METEO_FORECAST_URL: 'file:///weather' }, 'HTTP ou HTTPS'],
    [{ OPEN_METEO_GEOCODING_URL: 'not a URL' }, 'URL válida'],
  ])('rejeita configuração inválida %o', (environment, message) => {
    expect(() => loadEnvironment(environment)).toThrow(message);
  });
});
