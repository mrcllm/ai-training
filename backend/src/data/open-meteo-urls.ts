import type { Coordinates } from '../types/coordinates';

const CURRENT_FIELDS = 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m';

export function locationSearchUrl(baseUrl: string, query: string): URL {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams({
    name: query, count: '8', language: 'pt', countryCode: 'BR', format: 'json',
  }).toString();
  return url;
}

export function locationLookupUrl(baseUrl: string, locationId: number): URL {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams({ id: String(locationId), language: 'pt' }).toString();
  return url;
}

export function forecastRequestUrl(baseUrl: string, coordinates: Coordinates): URL {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    current: CURRENT_FIELDS,
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  }).toString();
  return url;
}
