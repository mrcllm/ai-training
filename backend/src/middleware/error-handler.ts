import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import type { AppErrorLogLevel } from '../types/app-error-log-level';
import { logger } from '../observability/logger';
import type { ApiError, ApiErrorCode } from '../types/api-error';

const INTERNAL_ERROR: ApiError = {
  error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno. Tente novamente.' },
};
const BAD_REQUEST_STATUS = 400;
const INTERNAL_ERROR_STATUS = 500;

type ErrorDescriptor = {
  status: number;
  code: ApiErrorCode;
  message: string;
  level: AppErrorLogLevel;
};

function isJsonParseError(error: unknown): boolean {
  return error instanceof SyntaxError && 'body' in error;
}

function describeError(error: unknown): ErrorDescriptor {
  if (error instanceof AppError) {
    return { status: error.statusCode, code: error.code, message: error.publicMessage, level: error.logLevel };
  }
  if (isJsonParseError(error)) {
    return { status: BAD_REQUEST_STATUS, code: 'INVALID_REQUEST', message: 'Corpo JSON inválido.', level: 'warn' };
  }
  return {
    status: INTERNAL_ERROR_STATUS,
    code: 'INTERNAL_ERROR',
    message: INTERNAL_ERROR.error.message,
    level: 'error',
  };
}

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  const descriptor = describeError(error);
  const requestId = response.locals.requestId as string | undefined;
  logger[descriptor.level]('http_request_failed', {
    requestId, route: request.path, method: request.method, status: descriptor.status, code: descriptor.code,
  });
  response.status(descriptor.status).json({ error: { code: descriptor.code, message: descriptor.message } });
};
