import { parseForecastResponse } from './parse-forecast-response';
import { parseGeocodingResponse } from './parse-geocoding-response';
import { providerUnavailable } from './provider-error';
import type { Coordinates } from '../types/coordinates';
import type { ProviderConditions } from '../types/provider-conditions';
import type { ResolvedLocation } from '../types/resolved-location';
import type { WeatherProvider } from '../types/weather-provider';

type OpenMeteoClientOptions = {
  geocodingUrl: string;
  forecastUrl: string;
  fetcher?: typeof fetch;
};

const CURRENT_FIELDS = 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m';

async function requestJson(url: URL, signal: AbortSignal, fetcher: typeof fetch): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(url, { signal });
  } catch {
    throw providerUnavailable('Falha de rede ao consultar a Open-Meteo');
  }
  if (!response.ok) throw providerUnavailable(`Resposta HTTP ${response.status} da Open-Meteo`);
  try {
    return await response.json() as unknown;
  } catch {
    throw providerUnavailable('JSON inválido recebido da Open-Meteo');
  }
}

function geocodingRequestUrl(baseUrl: string, city: string): URL {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams({ name: city, count: '1', language: 'pt', format: 'json' }).toString();
  return url;
}

function forecastRequestUrl(baseUrl: string, coordinates: Coordinates): URL {
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

export function createOpenMeteoClient(options: OpenMeteoClientOptions): WeatherProvider {
  const fetcher = options.fetcher ?? fetch;
  return {
    async findLocations(city: string, signal: AbortSignal): Promise<ResolvedLocation[]> {
      const payload = await requestJson(geocodingRequestUrl(options.geocodingUrl, city), signal, fetcher);
      return parseGeocodingResponse(payload);
    },
    async getCurrentConditions(coordinates: Coordinates, signal: AbortSignal): Promise<ProviderConditions> {
      const payload = await requestJson(forecastRequestUrl(options.forecastUrl, coordinates), signal, fetcher);
      return parseForecastResponse(payload);
    },
  };
}
