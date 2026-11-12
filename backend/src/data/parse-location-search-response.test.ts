import { describe, expect, it } from 'vitest';
import invalidPayload from './fixtures/location-search-invalid.json';
import validPayload from './fixtures/location-search-valid.json';
import { parseLocationSearchResponse } from './parse-location-search-response';

describe('parseLocationSearchResponse', () => {
  it('preserva a ordem, normaliza opcionais e remove localidades estrangeiras', () => {
    expect(parseLocationSearchResponse(validPayload)).toEqual([
      { id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', countryCode: 'BR', latitude: -23.55, longitude: -46.63 },
      { id: 3388368, name: 'São Luís', admin1: null, country: 'Brasil', countryCode: 'BR', latitude: -2.53, longitude: -44.3 },
    ]);
  });

  it('limita a resposta a oito entradas antes do mapeamento', () => {
    const results = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1, name: `Cidade ${index}`, country_code: 'BR', latitude: 0, longitude: 0,
    }));
    expect(parseLocationSearchResponse({ results })).toHaveLength(8);
  });

  it.each([{ generationtime_ms: 1 }, { results: [] }])('representa busca vazia válida', (payload) => {
    expect(parseLocationSearchResponse(payload)).toEqual([]);
  });

  it.each([null, [], { results: null }, invalidPayload, { results: [{ country_code: 5 }] }])(
    'rejeita payload externo inválido',
    (payload) => expect(() => parseLocationSearchResponse(payload)).toThrowError(
      expect.objectContaining({ code: 'LOCATION_PROVIDER_UNAVAILABLE', statusCode: 503 }),
    ),
  );
});
