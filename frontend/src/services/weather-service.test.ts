import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather } from './weather-service';
import { weatherResponse } from '../test/weather-fixtures';

const signal = new AbortController().signal;

afterEach(() => vi.unstubAllGlobals());

describe('fetchWeather', () => {
  it('requests the requested city and returns a valid weather response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => weatherResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchWeather('Lisboa', signal)).resolves.toEqual(weatherResponse);
    const url = fetchMock.mock.calls[0]?.[0] as URL;
    const options = fetchMock.mock.calls[0]?.[1] as { signal: AbortSignal };
    expect(url).toEqual(new URL('http://localhost:3001/weather?city=Lisboa'));
    expect(options.signal).toBe(signal);
  });

  it('TU-17 fetchWeather converte INVALID_CITY no kind validation sem texto', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { code: 'INVALID_CITY' } }),
    }));

    await expect(fetchWeather(' ', signal)).rejects.toEqual({ kind: 'validation' });
  });

  it('TU-17 fetchWeather converte CITY_NOT_FOUND no kind not-found sem texto', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { code: 'CITY_NOT_FOUND' } }),
    }));

    await expect(fetchWeather('Atlantis', signal)).rejects.toEqual({ kind: 'not-found' });
  });

  it('uses a generic error for unrecognized API responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { code: 'UNEXPECTED' } }),
    }));

    await expect(fetchWeather('Lisboa', signal)).rejects.toMatchObject({ kind: 'unavailable' });
  });

  it('rejects malformed successful payloads', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

    await expect(fetchWeather('Lisboa', signal)).rejects.toMatchObject({ kind: 'unavailable' });
  });
});
