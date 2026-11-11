import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../observability/logger';

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,128}$/;

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  const incomingId = request.header('X-Request-Id');
  const requestId = incomingId !== undefined && REQUEST_ID_PATTERN.test(incomingId) ? incomingId : randomUUID();
  const startedAt = Date.now();
  response.locals.requestId = requestId;
  response.setHeader('X-Request-Id', requestId);
  response.on('finish', () => {
    logger.info('http_request_completed', {
      requestId,
      route: request.path,
      method: request.method,
      status: response.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
}
