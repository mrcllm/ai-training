import { describe, expect, it } from 'vitest';
import validPayload from './fixtures/geocoding-valid.json';
import invalidPayload from './fixtures/geocoding-invalid.json';
import { parseGeocodingResponse } from './parse-geocoding-response';

describe('parseGeocodingResponse', () => {
  it('usa somente a primeira localidade e normaliza os campos opcionais', () => {
    expect(parseGeocodingResponse(validPayload)).toEqual([{
      name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', latitude: -23.55, longitude: -46.63,
    }]);
    expect(parseGeocodingResponse({ results: [{ name: 'Remote', latitude: 0, longitude: 0 }] })).toEqual([{
      name: 'Remote', admin1: null, country: null, latitude: 0, longitude: 0,
    }]);
  });

  it('representa uma resposta válida sem localidades como lista vazia', () => {
    expect(parseGeocodingResponse({ results: [] })).toEqual([]);
  });

  it.each([null, {}, { results: null }, invalidPayload, { results: [{ name: ' ', latitude: 0, longitude: 0 }] }])(
    'rejeita payload externo inválido',
    (payload) => expect(() => parseGeocodingResponse(payload)).toThrowError(
      expect.objectContaining({ code: 'WEATHER_PROVIDER_UNAVAILABLE', statusCode: 503 }),
    ),
  );

  it('rejeita divisão administrativa com tipo inesperado', () => {
    expect(() => parseGeocodingResponse({ results: [{ name: 'City', latitude: 0, longitude: 0, admin1: 5 }] }))
      .toThrowError(expect.objectContaining({ code: 'WEATHER_PROVIDER_UNAVAILABLE' }));
  });
});
