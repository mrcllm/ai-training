import { describe, expect, it, vi } from 'vitest';
import lookupPayload from './fixtures/location-lookup-valid.json';
import searchPayload from './fixtures/location-search-valid.json';
import forecastPayload from './fixtures/forecast-valid.json';
import { createOpenMeteoClient } from './open-meteo-client';

const urls = { geocodingUrl: 'https://geo.test/search', geocodingLookupUrl: 'https://geo.test/get', forecastUrl: 'https://weather.test/forecast' };
const signal = new AbortController().signal;

describe('Open-Meteo client', () => {
  it('envia parâmetros explícitos para busca, lookup e previsão', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(Response.json(searchPayload))
      .mockResolvedValueOnce(Response.json(lookupPayload))
      .mockResolvedValueOnce(Response.json(forecastPayload));
    const client = createOpenMeteoClient({ ...urls, fetcher });
    const suggestions = await client.searchLocations('Sao', signal);
    const location = await client.getLocation(suggestions[0].id, signal);
    await client.getCurrentConditions(location!, signal);
    const searchUrl = new URL(fetcher.mock.calls[0][0] as URL);
    const lookupUrl = new URL(fetcher.mock.calls[1][0] as URL);
    const forecastUrl = new URL(fetcher.mock.calls[2][0] as URL);
    expect(Object.fromEntries(searchUrl.searchParams)).toEqual({ name: 'Sao', count: '8', language: 'pt', countryCode: 'BR', format: 'json' });
    expect(Object.fromEntries(lookupUrl.searchParams)).toEqual({ id: '3448439', language: 'pt' });
    expect(forecastUrl.searchParams.get('latitude')).toBe('-23.55');
    expect(forecastUrl.searchParams.get('current')).toContain('relative_humidity_2m');
  });

  it('converte not-found conhecido do lookup em null', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(
      { error: true, reason: 'Location ID not found.' }, { status: 400 },
    ));
    const client = createOpenMeteoClient({ ...urls, fetcher });
    await expect(client.getLocation(1, signal)).resolves.toBeNull();
  });

  it('diferencia indisponibilidade de localização e clima', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 429 }));
    const client = createOpenMeteoClient({ ...urls, fetcher });
    await expect(client.searchLocations('Recife', signal)).rejects.toMatchObject({ code: 'LOCATION_PROVIDER_UNAVAILABLE' });
    await expect(client.getLocation(1, signal)).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' });
  });

  it('converte rede e JSON inválido sem retry', async () => {
    const networkFetcher = vi.fn().mockRejectedValue(new Error('network detail'));
    const invalidFetcher = vi.fn().mockResolvedValue(new Response('{'));
    await expect(createOpenMeteoClient({ ...urls, fetcher: networkFetcher }).searchLocations('Recife', signal))
      .rejects.toMatchObject({ code: 'LOCATION_PROVIDER_UNAVAILABLE', logLevel: 'warn', outcome: 'external_failure' });
    await expect(createOpenMeteoClient({ ...urls, fetcher: invalidFetcher }).getLocation(1, signal))
      .rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE', logLevel: 'error', outcome: 'invalid_payload' });
    expect(networkFetcher).toHaveBeenCalledTimes(1);
    expect(invalidFetcher).toHaveBeenCalledTimes(1);
  });

  it('classifica cancelamento sem fazer retry', async () => {
    const controller = new AbortController();
    const fetcher = vi.fn((_url, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }));
    const result = createOpenMeteoClient({ ...urls, fetcher }).searchLocations('Recife', controller.signal);
    controller.abort();
    await expect(result).rejects.toMatchObject({ logLevel: 'warn', outcome: 'aborted' });
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
