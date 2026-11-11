import { describe, expect, it, vi } from 'vitest';
import { createOpenMeteoClient } from './open-meteo-client';

const geocodingPayload = { results: [{ name: 'São Paulo', latitude: -23.5, longitude: -46.6 }] };
const forecastPayload = {
  current: { temperature_2m: 18.4, apparent_temperature: 17.9, relative_humidity_2m: 72, weather_code: 2, wind_speed_10m: 14.2 },
  current_units: { temperature_2m: '°C', apparent_temperature: '°C', relative_humidity_2m: '%', wind_speed_10m: 'km/h' },
};

describe('Open-Meteo client', () => {
  it('sends explicit geocoding and metric forecast parameters', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(geocodingPayload)))
      .mockResolvedValueOnce(new Response(JSON.stringify(forecastPayload)));
    const client = createOpenMeteoClient({ geocodingUrl: 'https://geo.test/search', forecastUrl: 'https://weather.test/forecast', fetcher });
    const controller = new AbortController();
    const locations = await client.findLocations('São Paulo', controller.signal);
    const conditions = await client.getCurrentConditions(locations[0], controller.signal);
    const geoUrl = new URL(fetcher.mock.calls[0][0] as URL);
    const forecastUrl = new URL(fetcher.mock.calls[1][0] as URL);
    expect(geoUrl.searchParams.get('name')).toBe('São Paulo');
    expect(forecastUrl.searchParams.get('latitude')).toBe('-23.5');
    expect(forecastUrl.searchParams.get('longitude')).toBe('-46.6');
    expect(geoUrl.searchParams.get('count')).toBe('1');
    expect(geoUrl.searchParams.get('language')).toBe('pt');
    expect(geoUrl.searchParams.get('format')).toBe('json');
    expect(forecastUrl.searchParams.get('current')).toBe('temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m');
    expect(forecastUrl.searchParams.get('temperature_unit')).toBe('celsius');
    expect(forecastUrl.searchParams.get('wind_speed_unit')).toBe('kmh');
    expect(forecastUrl.searchParams.get('timezone')).toBe('auto');
    expect(conditions.current.windSpeed).toBe(14.2);
  });

  it('converts HTTP and malformed JSON responses to provider unavailable', async () => {
    const httpFailure = createOpenMeteoClient({ geocodingUrl: 'https://geo.test/search', forecastUrl: 'https://weather.test', fetcher: vi.fn().mockResolvedValue(new Response('', { status: 429 })) });
    const invalidJson = createOpenMeteoClient({ geocodingUrl: 'https://geo.test/search', forecastUrl: 'https://weather.test', fetcher: vi.fn().mockResolvedValue(new Response('{')) });
    const signal = new AbortController().signal;
    await expect(httpFailure.findLocations('Lisboa', signal)).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' });
    await expect(invalidJson.findLocations('Lisboa', signal)).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' });
  });

  it('converts network failures without retrying', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network detail'));
    const client = createOpenMeteoClient({ geocodingUrl: 'https://geo.test/search', forecastUrl: 'https://weather.test', fetcher });
    await expect(client.findLocations('Lisboa', new AbortController().signal)).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_UNAVAILABLE' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('uses only the first geocoding result', async () => {
    const client = createOpenMeteoClient({ geocodingUrl: 'https://geo.test/search', forecastUrl: 'https://weather.test', fetcher: vi.fn().mockResolvedValue(new Response(JSON.stringify(geocodingPayload))) });
    const results = await client.findLocations('São Paulo', new AbortController().signal);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('São Paulo');
  });
});
