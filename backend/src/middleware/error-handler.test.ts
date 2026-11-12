import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors/app-error';
import { invalidLocationProviderPayload, weatherProviderUnavailable } from '../errors/provider-unavailable';
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

afterEach(() => vi.restoreAllMocks());

describe('errorHandler', () => {
  it('returns the stable public envelope for application errors', () => {
    vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const result = invokeErrorHandler(new AppError({ statusCode: 404, code: 'LOCATION_NOT_FOUND', publicMessage: 'Localidade não encontrada.', detail: 'private detail' }));
    expect(result).toEqual({ status: 404, body: { error: { code: 'LOCATION_NOT_FOUND', message: 'Localidade não encontrada.' } } });
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
    const result = invokeErrorHandler(new AppError({ statusCode: 400, code: 'INVALID_LOCATION_ID', publicMessage: 'Localidade inválida.', detail: 'raw input detail' }));
    expect(JSON.stringify(result.body)).not.toContain('raw input detail');
  });

  it('registra indisponibilidade do provedor como aviso, sem nível de erro interno', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const result = invokeErrorHandler(weatherProviderUnavailable('HTTP 502'));
    expect(result.status).toBe(503);
    expect(warn).toHaveBeenCalledWith('http_request_failed', expect.objectContaining({ code: 'WEATHER_PROVIDER_UNAVAILABLE' }));
    expect(error).not.toHaveBeenCalled();
  });

  it('registra payload externo incompatível com nível de erro', () => {
    const error = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    invokeErrorHandler(invalidLocationProviderPayload('payload'));
    expect(error).toHaveBeenCalledWith('http_request_failed', expect.objectContaining({ code: 'LOCATION_PROVIDER_UNAVAILABLE', status: 503 }));
  });

  it('registra falhas internas inesperadas com nível de erro', () => {
    const error = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    invokeErrorHandler(new Error('bug'));
    expect(error).toHaveBeenCalledWith('http_request_failed', expect.objectContaining({ code: 'INTERNAL_ERROR', status: 500 }));
  });

  it('responde 400 estável para corpo JSON malformado', () => {
    vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const malformed = Object.assign(new SyntaxError('Unexpected token'), { body: '{' });
    expect(invokeErrorHandler(malformed)).toEqual({ status: 400, body: { error: { code: 'INVALID_REQUEST', message: 'Corpo JSON inválido.' } } });
  });

  it('delegates errors after the response headers were sent', () => {
    const next = vi.fn();
    const response = { headersSent: true, locals: { requestId: 'request-1' } };
    errorHandler(new Error('late error'), { path: '/health', method: 'GET' } as never, response as never, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
