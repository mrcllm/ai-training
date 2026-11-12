import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather } from './weather-service';
import { stubBackend } from '../test/backend-stub';
import { weatherResponse } from '../test/weather-fixtures';

const signal = new AbortController().signal;

function stubError(code: string): void {
  stubBackend(() => ({ ok: false, body: { error: { code, message: 'x' } } }));
}

afterEach(() => vi.unstubAllGlobals());

describe('fetchWeather por locationId (TU-15)', () => {
  it('envia somente o locationId ao backend e preserva o sinal de cancelamento', async () => {
    const fetchMock = stubBackend(() => ({ ok: true, body: weatherResponse }));
    await expect(fetchWeather(3405940, signal)).resolves.toEqual(weatherResponse);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('http://localhost:3001/weather?locationId=3405940');
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({ signal });
  });

  it('TU-17 converte INVALID_LOCATION_ID no kind validation sem texto', async () => {
    stubError('INVALID_LOCATION_ID');
    await expect(fetchWeather(1, signal)).rejects.toEqual({ kind: 'validation' });
  });

  it('TU-17 converte LOCATION_NOT_FOUND no kind not-found sem texto', async () => {
    stubError('LOCATION_NOT_FOUND');
    await expect(fetchWeather(1, signal)).rejects.toEqual({ kind: 'not-found' });
  });

  it.each(['WEATHER_PROVIDER_UNAVAILABLE', 'INTERNAL_ERROR', 'DESCONHECIDO'])('trata %s como indisponibilidade', async (code) => {
    stubError(code);
    await expect(fetchWeather(1, signal)).rejects.toMatchObject({ kind: 'unavailable' });
  });

  it('recusa payload de sucesso malformado', async () => {
    stubBackend(() => ({ ok: true, body: { ...weatherResponse, units: { temperature: 'F' } } }));
    await expect(fetchWeather(1, signal)).rejects.toMatchObject({ kind: 'unavailable' });
  });

  it('recusa corpo não JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('x'); } }));
    await expect(fetchWeather(1, signal)).rejects.toMatchObject({ kind: 'unavailable' });
  });
});
