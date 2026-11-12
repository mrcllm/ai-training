import { describe, expect, it } from 'vitest';
import { normalizeLocationQuery } from './normalize-location-query';

describe('normalizeLocationQuery', () => {
  it('normaliza Unicode e espaços sem remover diacríticos', () => {
    expect(normalizeLocationQuery('  Sa\u0303o   Paulo  ')).toBe('São Paulo');
    expect(normalizeLocationQuery('A B')).toBe('A B');
  });

  it.each([undefined, ['São'], '', ' ', 'A', ' '.repeat(20), 'A'.repeat(101), '\uD800A', 'A\uDC00'])(
    'rejeita query ausente, não escalar ou fora dos limites: %o',
    (value) => expect(() => normalizeLocationQuery(value)).toThrowError(
      expect.objectContaining({ code: 'INVALID_LOCATION_QUERY', statusCode: 400 }),
    ),
  );

  it('aceita pares surrogate válidos como um único ponto de código', () => {
    expect(normalizeLocationQuery('😀 A')).toBe('😀 A');
  });
});
