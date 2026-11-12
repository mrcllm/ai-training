import { Router, type RequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../observability/logger';
import { normalizeLocationId } from '../services/normalize-location-id';
import { responseAbortController } from './response-abort-controller';
import type { WeatherResponse } from '../types/weather-response';

type WeatherSearch = (locationId: number, signal: AbortSignal, requestId?: string) => Promise<WeatherResponse>;

type WeatherRouteDependencies = {
  getCurrentWeather: WeatherSearch;
};

type WeatherLogContext = {
  requestId?: string;
  route: string;
  startedAt: number;
};

const OK_STATUS = 200;
const INTERNAL_ERROR_STATUS = 500;

function logWeatherFailure(error: unknown, context: WeatherLogContext): void {
  const status = error instanceof AppError ? error.statusCode : INTERNAL_ERROR_STATUS;
  const outcome = error instanceof AppError ? error.outcome : 'internal_error';
  const level = error instanceof AppError ? error.logLevel : 'error';
  logger[level]('weather_request_completed', {
    requestId: context.requestId, route: context.route, status,
    durationMs: Date.now() - context.startedAt, outcome,
  });
}

function weatherHandler(dependencies: WeatherRouteDependencies): RequestHandler {
  return async (request, response, next) => {
    const startedAt = Date.now();
    const requestId = response.locals.requestId as string | undefined;
    response.setHeader('Cache-Control', 'no-store');
    const controller = responseAbortController(response);
    try {
      const locationId = normalizeLocationId(request.query.locationId);
      const weather = await dependencies.getCurrentWeather(locationId, controller.signal, requestId);
      logger.info('weather_request_completed', {
        requestId, route: request.path, status: OK_STATUS, durationMs: Date.now() - startedAt, outcome: 'success',
      });
      response.status(OK_STATUS).json(weather);
    } catch (error: unknown) {
      logWeatherFailure(error, { requestId, route: request.path, startedAt });
      next(error);
    }
  };
}

export function createWeatherRoute(dependencies: WeatherRouteDependencies): Router {
  const router = Router();
  router.get('/weather', weatherHandler(dependencies));
  return router;
}
