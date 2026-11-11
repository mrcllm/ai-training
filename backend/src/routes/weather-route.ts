import { Router } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../observability/logger';
import { normalizeCity } from '../services/normalize-city';
import type { WeatherResponse } from '../types/weather-response';

type WeatherSearch = (city: string, signal: AbortSignal) => Promise<WeatherResponse>;

type WeatherRouteDependencies = {
  getCurrentWeather: WeatherSearch;
};

export function createWeatherRoute(dependencies: WeatherRouteDependencies): Router {
  const router = Router();
  router.get('/weather', async (request, response, next) => {
    const startedAt = Date.now();
    response.setHeader('Cache-Control', 'no-store');
    const controller = new AbortController();
    response.once('close', () => {
      if (!response.writableEnded) controller.abort();
    });
    try {
      const city = normalizeCity(request.query.city);
      const weather = await dependencies.getCurrentWeather(city, controller.signal);
      logger.info('weather_request_completed', {
        requestId: response.locals.requestId as string | undefined,
        route: request.path,
        status: 200,
        durationMs: Date.now() - startedAt,
        outcome: 'success',
      });
      response.status(200).json(weather);
    } catch (error: unknown) {
      if (!(error instanceof AppError)) {
        next(error);
        return;
      }
      logger.warn('weather_request_completed', {
        requestId: response.locals.requestId as string | undefined,
        route: request.path,
        status: error.statusCode,
        durationMs: Date.now() - startedAt,
        outcome: error.code,
      });
      next(error);
    }
  });
  return router;
}
