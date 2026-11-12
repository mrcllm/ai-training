import { describe, expect, it } from 'vitest';
import invalidPayload from './fixtures/location-search-invalid.json';
import validPayload from './fixtures/location-search-valid.json';
import { parseLocationSearchResponse } from './parse-location-search-response';

describe('parseLocationSearchResponse', () => {
  it('preserva a ordem, normaliza opcionais e mantém localidades de qualquer país', () => {
    expect(parseLocationSearchResponse(validPayload)).toEqual([
      { id: 3448439, name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', latitude: -23.55, longitude: -46.63 },
      { id: 3388368, name: 'São Luís', admin1: null, country: 'Brasil', latitude: -2.53, longitude: -44.3 },
      { id: 5128581, name: 'São Paulo', admin1: 'New York', country: 'Estados Unidos', latitude: 40.7, longitude: -74 },
    ]);
  });

  it('aceita localidade sem país informado pela origem', () => {
    const results = [{ id: 1, name: 'Ilha remota', latitude: 10, longitude: 20 }];
    expect(parseLocationSearchResponse({ results })).toEqual([
      { id: 1, name: 'Ilha remota', admin1: null, country: null, latitude: 10, longitude: 20 },
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

  it.each([null, [], { results: null }, invalidPayload, { results: [{ id: 1, name: 5, latitude: 0, longitude: 0 }] }])(
    'rejeita payload externo inválido',
    (payload) => expect(() => parseLocationSearchResponse(payload)).toThrowError(
      expect.objectContaining({ code: 'LOCATION_PROVIDER_UNAVAILABLE', statusCode: 503 }),
    ),
  );
});
