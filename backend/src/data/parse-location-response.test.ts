import { describe, expect, it } from 'vitest';
import validPayload from './fixtures/location-lookup-valid.json';
import { parseLocationResponse } from './parse-location-response';

describe('parseLocationResponse', () => {
  it('interpreta o objeto de localidade resolvido por ID', () => {
    expect(parseLocationResponse(validPayload)).toMatchObject({
      id: 3448439, name: 'São Paulo', countryCode: 'BR', latitude: -23.55, longitude: -46.63,
    });
  });

  it('normaliza campos opcionais vazios para null', () => {
    expect(parseLocationResponse({ ...validPayload, admin1: '   ', country: '' })).toMatchObject({ admin1: null, country: null });
  });

  it.each([{}, { ...validPayload, id: 0 }, { ...validPayload, latitude: 91 }, { ...validPayload, country_code: null }])(
    'rejeita lookup inválido',
    (payload) => expect(() => parseLocationResponse(payload)).toThrowError(
      expect.objectContaining({ code: 'WEATHER_PROVIDER_UNAVAILABLE', statusCode: 503 }),
    ),
  );
});
