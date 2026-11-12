import { describe, expect, it } from 'vitest';
import { AppError } from './app-error';
import { invalidLocationProviderPayload, weatherProviderUnavailable } from './provider-unavailable';

describe('AppError', () => {
  it('preserves the public error contract and internal context separately', () => {
    const error = new AppError({ statusCode: 404, code: 'LOCATION_NOT_FOUND', publicMessage: 'Localidade não encontrada.', detail: 'provider detail' });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppError');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('LOCATION_NOT_FOUND');
    expect(error.publicMessage).toBe('Localidade não encontrada.');
    expect(error.message).toBe('provider detail');
    expect(error.logLevel).toBe('warn');
    expect(error.outcome).toBe('location_not_found');
  });

  it('uses the public message as its internal message by default', () => {
    const error = new AppError({ statusCode: 400, code: 'INVALID_LOCATION_ID', publicMessage: 'Selecione uma localidade.' });
    expect(error.message).toBe('Selecione uma localidade.');
  });

  it('cria a indisponibilidade do provedor com mensagem pública acionável e detalhe interno separado', () => {
    const error = weatherProviderUnavailable('Resposta HTTP 429 da Open-Meteo');
    expect(error).toMatchObject({
      statusCode: 503,
      code: 'WEATHER_PROVIDER_UNAVAILABLE',
      publicMessage: 'Não foi possível consultar o clima agora. Tente novamente em instantes.',
      message: 'Resposta HTTP 429 da Open-Meteo',
      logLevel: 'warn',
      outcome: 'external_failure',
    });
  });

  it('classifica payload inválido da busca de localidades como erro com mensagem própria', () => {
    const error = invalidLocationProviderPayload('JSON inválido');
    expect(error).toMatchObject({
      statusCode: 503,
      code: 'LOCATION_PROVIDER_UNAVAILABLE',
      publicMessage: 'Não foi possível buscar localidades agora. Tente novamente.',
      logLevel: 'error',
      outcome: 'invalid_payload',
    });
  });

  it('deriva nível de erro para falhas 5xx sem classificação explícita', () => {
    const error = new AppError({ statusCode: 500, code: 'INTERNAL_ERROR', publicMessage: 'Erro.' });
    expect(error.logLevel).toBe('error');
  });
});
