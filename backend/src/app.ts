import cors from 'cors';
import express, { type Express } from 'express';
import { createOpenMeteoClient } from './data/open-meteo-client';
import { getCurrentWeather } from './services/get-current-weather';
import type { Environment } from './config/environment';
import { errorHandler } from './middleware/error-handler';
import { requestIdMiddleware } from './middleware/request-id';
import { healthRoute } from './routes/health-route';
import { createWeatherRoute } from './routes/weather-route';
import type { WeatherProvider } from './types/weather-provider';

type AppDependencies = {
  weatherProvider?: WeatherProvider;
};

export function createApp(environment: Environment, dependencies: AppDependencies = {}): Express {
  const app = express();
  const frontendOriginUrl = new URL(environment.frontendOrigin);
  const frontendOrigins = [environment.frontendOrigin];
  if (frontendOriginUrl.hostname === 'localhost' || frontendOriginUrl.hostname === '127.0.0.1') {
    frontendOriginUrl.hostname = frontendOriginUrl.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
    frontendOrigins.push(frontendOriginUrl.origin);
  }
  const weatherProvider = dependencies.weatherProvider ?? createOpenMeteoClient({
    geocodingUrl: environment.geocodingUrl,
    forecastUrl: environment.forecastUrl,
  });
  app.use(requestIdMiddleware);
  app.use(cors({ origin: frontendOrigins, exposedHeaders: ['X-Request-Id'] }));
  app.use(express.json());
  app.use(healthRoute);
  app.use(createWeatherRoute({
    getCurrentWeather: (city, signal) => getCurrentWeather(city, {
      provider: weatherProvider,
      timeoutMs: environment.weatherTimeoutMs,
      signal,
    }),
  }));
  app.use(errorHandler);
  return app;
}
