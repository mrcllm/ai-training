import { describe, expect, it } from 'vitest';
import { AppError } from './app-error';

describe('AppError', () => {
  it('preserves the public error contract and internal context separately', () => {
    const error = new AppError(404, 'CITY_NOT_FOUND', 'Cidade não encontrada.', 'provider detail');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppError');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('CITY_NOT_FOUND');
    expect(error.publicMessage).toBe('Cidade não encontrada.');
    expect(error.message).toBe('provider detail');
  });

  it('uses the public message as its internal message by default', () => {
    const error = new AppError(400, 'INVALID_CITY', 'Informe uma cidade.');
    expect(error.message).toBe('Informe uma cidade.');
  });
});
