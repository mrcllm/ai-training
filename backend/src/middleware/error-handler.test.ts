import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors/app-error';
import { logger } from '../observability/logger';
import { errorHandler } from './error-handler';

function invokeErrorHandler(error: unknown): { status: number; body: unknown } {
  const result = { status: 0, body: undefined as unknown };
  const response = {
    locals: { requestId: 'request-1' },
    status(code: number) { result.status = code; return this; },
    json(body: unknown) { result.body = body; return this; },
  };
  const request = { path: '/health', method: 'GET' };
  errorHandler(error, request as never, response as never, (() => undefined) as never);
  return result;
}

describe('errorHandler', () => {
  it('returns the stable public envelope for application errors', () => {
    vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const result = invokeErrorHandler(new AppError(404, 'CITY_NOT_FOUND', 'Cidade não encontrada.', 'private detail'));
    expect(result).toEqual({ status: 404, body: { error: { code: 'CITY_NOT_FOUND', message: 'Cidade não encontrada.' } } });
  });

  it('does not expose unexpected internal error details', () => {
    vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const result = invokeErrorHandler(new Error('secret provider payload'));
    expect(result.status).toBe(500);
    expect(JSON.stringify(result.body)).not.toContain('secret provider payload');
    expect(result.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno. Tente novamente.' } });
  });

  it('logs known errors without writing their private message to the response', () => {
    vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const result = invokeErrorHandler(new AppError(400, 'INVALID_CITY', 'Cidade inválida.', 'raw input detail'));
    expect(JSON.stringify(result.body)).not.toContain('raw input detail');
  });

  it('delegates errors after the response headers were sent', () => {
    const next = vi.fn();
    const response = { headersSent: true, locals: { requestId: 'request-1' } };
    errorHandler(new Error('late error'), { path: '/health', method: 'GET' } as never, response as never, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
