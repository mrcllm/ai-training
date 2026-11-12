import { describe, expect, it } from 'vitest';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('substitui os marcadores pelos valores informados', () => {
    const result = interpolate('{count} localidades para {query}.', { count: 3, query: 'Bom' });
    expect(result).toBe('3 localidades para Bom.');
  });

  it('mantém marcadores sem valor correspondente', () => {
    const result = interpolate('Olá, {name}.', {});
    expect(result).toBe('Olá, {name}.');
  });
});
