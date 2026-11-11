import { describe, expect, it } from 'vitest';
import { AppError } from '../errors/app-error';
import { normalizeCity } from './normalize-city';

describe('normalizeCity', () => {
  it('preserva Unicode e normaliza espaços e composição NFC', () => {
    const result = normalizeCity('  São   Paulo  ');
    expect(result).toBe('São Paulo');
  });

  it.each([undefined, null, 42, '', '  ', 'A', 'a'.repeat(101)])('rejeita entradas inválidas: %s', (city) => {
    expect(() => normalizeCity(city)).toThrowError(AppError);
    expect(() => normalizeCity(city)).toThrowError(expect.objectContaining({ code: 'INVALID_CITY', statusCode: 400 }));
  });

  it('aceita os limites de 2 e 100 caracteres úteis', () => {
    expect(normalizeCity('ab')).toBe('ab');
    expect(normalizeCity('a'.repeat(100))).toHaveLength(100);
  });
});
