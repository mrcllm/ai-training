import { Router } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../observability/logger';
import { normalizeLocationQuery } from '../services/normalize-location-query';
import { responseAbortController } from './response-abort-controller';
import type { LocationSuggestionsResponse } from '../types/location-suggestions-response';

type LocationSearch = (query: string, signal: AbortSignal, requestId?: string) => Promise<LocationSuggestionsResponse>;
type LocationsRouteDependencies = { searchLocations: LocationSearch };

export function createLocationsRoute(dependencies: LocationsRouteDependencies): Router {
  const router = Router();
  router.get('/locations', async (request, response, next) => {
    const startedAt = Date.now();
    const requestId = response.locals.requestId as string | undefined;
    response.setHeader('Cache-Control', 'no-store');
    const controller = responseAbortController(response);
    try {
      const query = normalizeLocationQuery(request.query.query);
      const result = await dependencies.searchLocations(query, controller.signal, requestId);
      const level = result.suggestions.length === 0 ? 'warn' : 'info';
      logger[level]('locations_request_completed', {
        requestId, route: request.path, status: 200,
        durationMs: Date.now() - startedAt, outcome: result.suggestions.length === 0 ? 'empty' : 'success', resultCount: result.suggestions.length,
      });
      response.status(200).json(result);
    } catch (error: unknown) {
      const status = error instanceof AppError ? error.statusCode : 500;
      const outcome = error instanceof AppError ? error.outcome : 'internal_error';
      const level = error instanceof AppError ? error.logLevel : 'error';
      logger[level]('locations_request_completed', {
        requestId, route: request.path, status, durationMs: Date.now() - startedAt, outcome,
      });
      next(error);
    }
  });
  return router;
}
