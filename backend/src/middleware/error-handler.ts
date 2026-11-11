import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../observability/logger';
import type { ApiError, ApiErrorCode } from '../types/api-error';

const INTERNAL_ERROR: ApiError = {
  error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno. Tente novamente.' },
};

function isJsonParseError(error: unknown): boolean {
  return error instanceof SyntaxError && 'body' in error;
}

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, _next) => {
  const requestId = response.locals.requestId as string | undefined;
  const isAppError = error instanceof AppError;
  const isMalformedJson = isJsonParseError(error);
  const status = isAppError ? error.statusCode : isMalformedJson ? 400 : 500;
  const code: ApiErrorCode = isAppError ? error.code : isMalformedJson ? 'INVALID_REQUEST' : 'INTERNAL_ERROR';
  const message = isAppError ? error.publicMessage : isMalformedJson ? 'Corpo JSON inválido.' : INTERNAL_ERROR.error.message;
  const level = status >= 500 ? 'error' : 'warn';
  if (response.headersSent) {
    _next(error);
    return;
  }
  logger[level]('http_request_failed', { requestId, route: request.path, method: request.method, status, code });
  response.status(status).json({ error: { code, message } });
};
