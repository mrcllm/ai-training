import cors from 'cors';
import express, { type Express } from 'express';
import { createOpenMeteoClient } from './data/open-meteo-client';
import { getCurrentWeather } from './services/get-current-weather';
import { searchLocations } from './services/search-locations';
import type { Environment } from './config/environment';
import { errorHandler } from './middleware/error-handler';
import { requestIdMiddleware } from './middleware/request-id';
import { healthRoute } from './routes/health-route';
import { createLocationsRoute } from './routes/locations-route';
import { createWeatherRoute } from './routes/weather-route';
import type { WeatherProvider } from './types/weather-provider';

type AppDependencies = {
  weatherProvider?: WeatherProvider;
};

function allowedOrigins(origin: string): string[] {
  const frontendOriginUrl = new URL(origin);
  const origins = [origin];
  if (frontendOriginUrl.hostname !== 'localhost' && frontendOriginUrl.hostname !== '127.0.0.1') return origins;
  frontendOriginUrl.hostname = frontendOriginUrl.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
  return [...origins, frontendOriginUrl.origin];
}

function createProvider(environment: Environment, dependencies: AppDependencies): WeatherProvider {
  return dependencies.weatherProvider ?? createOpenMeteoClient({
    geocodingUrl: environment.geocodingUrl,
    geocodingLookupUrl: environment.geocodingLookupUrl,
    forecastUrl: environment.forecastUrl,
  });
}

function registerApiRoutes(app: Express, environment: Environment, provider: WeatherProvider): void {
  app.use(healthRoute);
  app.use(createLocationsRoute({
    searchLocations: (query, signal, requestId) => searchLocations(query, {
      provider, timeoutMs: environment.locationSearchTimeoutMs, signal, requestId,
    }),
  }));
  app.use(createWeatherRoute({
    getCurrentWeather: (locationId, signal, requestId) => getCurrentWeather(locationId, {
      provider, timeoutMs: environment.weatherTimeoutMs, signal, requestId,
    }),
  }));
}

export function createApp(environment: Environment, dependencies: AppDependencies = {}): Express {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(cors({ origin: allowedOrigins(environment.frontendOrigin), exposedHeaders: ['X-Request-Id'] }));
  app.use(express.json());
  registerApiRoutes(app, environment, createProvider(environment, dependencies));
  app.use(errorHandler);
  return app;
}
