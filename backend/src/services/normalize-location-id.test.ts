import { describe, expect, it } from 'vitest';
import { normalizeLocationId } from './normalize-location-id';

describe('normalizeLocationId', () => {
  it('aceita um identificador Int32 positivo', () => {
    expect(normalizeLocationId('3448439')).toBe(3448439);
    expect(normalizeLocationId('2147483647')).toBe(2147483647);
  });

  it.each([undefined, ['1'], '', 'abc', '1.5', '0', '-1', '2147483648'])('rejeita identificador inválido: %o', (value) => {
    expect(() => normalizeLocationId(value)).toThrowError(
      expect.objectContaining({ code: 'INVALID_LOCATION_ID', statusCode: 400 }),
    );
  });
});
