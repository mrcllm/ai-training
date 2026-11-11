import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';
import type { Environment } from '../config/environment';

const environment: Environment = {
  port: 3001,
  frontendOrigin: 'http://localhost:3000',
  geocodingUrl: 'https://geocoding-api.open-meteo.com/v1/search',
  forecastUrl: 'https://api.open-meteo.com/v1/forecast',
  weatherTimeoutMs: 2500,
  shutdownTimeoutMs: 10000,
};

afterEach(() => vi.restoreAllMocks());

describe('request ID and app middleware', () => {
  it('preserves health response and propagates a valid request ID', async () => {
    const response = await request(createApp(environment)).get('/health').set('X-Request-Id', 'trace-123');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'healthy' });
    expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    expect(response.headers['x-request-id']).toBe('trace-123');
  });

  it('generates a safe ID when the incoming header is invalid and configures CORS', async () => {
    const response = await request(createApp(environment)).get('/health').set('X-Request-Id', 'bad id').set('Origin', environment.frontendOrigin);
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.headers['access-control-allow-origin']).toBe(environment.frontendOrigin);
    expect(response.headers['access-control-expose-headers']).toContain('X-Request-Id');
  });

  it('generates a request ID when the header is absent', async () => {
    const response = await request(createApp(environment)).get('/health');
    expect(response.headers['x-request-id']).toBeTruthy();
  });

  it('routes malformed JSON through the public error handler', async () => {
    const response = await request(createApp(environment)).post('/health').set('Content-Type', 'application/json').send('{');
    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({ code: 'INVALID_REQUEST', message: 'Corpo JSON inválido.' });
    expect(response.headers['x-request-id']).toBeTruthy();
  });
});
