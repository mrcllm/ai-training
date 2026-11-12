import { parseForecastResponse } from './parse-forecast-response';
import { isRecord } from './parse-location';
import { parseLocationResponse } from './parse-location-response';
import { parseLocationSearchResponse } from './parse-location-search-response';
import { forecastRequestUrl, locationLookupUrl, locationSearchUrl } from './open-meteo-urls';
import {
  invalidLocationProviderPayload,
  invalidWeatherProviderPayload,
  locationProviderAborted,
  locationProviderUnavailable,
  weatherProviderAborted,
  weatherProviderUnavailable,
} from '../errors/provider-unavailable';
import { requestJson, type JsonResponse } from './request-json';
import type { WeatherProvider } from '../types/weather-provider';

type OpenMeteoClientOptions = {
  geocodingUrl: string;
  geocodingLookupUrl: string;
  forecastUrl: string;
  fetcher?: typeof fetch;
};

type Unavailable = typeof locationProviderUnavailable;

function requireSuccess(response: JsonResponse, unavailable: Unavailable): unknown {
  if (!response.ok) throw unavailable(`Resposta HTTP ${response.status} da Open-Meteo`);
  return response.payload;
}

function isLocationNotFound(response: JsonResponse): boolean {
  return response.status === 400 && isRecord(response.payload)
    && response.payload.error === true && response.payload.reason === 'Location ID not found.';
}

export function createOpenMeteoClient(options: OpenMeteoClientOptions): WeatherProvider {
  const fetcher = options.fetcher ?? fetch;
  return {
    async searchLocations(query, signal) {
      const url = locationSearchUrl(options.geocodingUrl, query);
      const response = await requestJson({
        url, signal, fetcher, unavailable: locationProviderUnavailable,
        aborted: locationProviderAborted, invalidPayload: invalidLocationProviderPayload,
      });
      return parseLocationSearchResponse(requireSuccess(response, locationProviderUnavailable));
    },
    async getLocation(locationId, signal) {
      const url = locationLookupUrl(options.geocodingLookupUrl, locationId);
      const response = await requestJson({
        url, signal, fetcher, unavailable: weatherProviderUnavailable,
        aborted: weatherProviderAborted, invalidPayload: invalidWeatherProviderPayload,
      });
      if (isLocationNotFound(response)) return null;
      return parseLocationResponse(requireSuccess(response, weatherProviderUnavailable));
    },
    async getCurrentConditions(coordinates, signal) {
      const url = forecastRequestUrl(options.forecastUrl, coordinates);
      const response = await requestJson({
        url, signal, fetcher, unavailable: weatherProviderUnavailable,
        aborted: weatherProviderAborted, invalidPayload: invalidWeatherProviderPayload,
      });
      return parseForecastResponse(requireSuccess(response, weatherProviderUnavailable));
    },
  };
}
