import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchLocationSuggestions } from './location-service';
import { stubBackend } from '../test/backend-stub';
import { bomJesusPiaui, recife, suggestionsResponse } from '../test/location-fixtures';

const signal = new AbortController().signal;
const unavailable = { kind: 'unavailable', message: 'Não foi possível buscar localidades agora. Tente novamente.' };

afterEach(() => vi.unstubAllGlobals());

describe('fetchLocationSuggestions (TU-08)', () => {
  it('consulta somente /locations do backend com a query e o sinal de cancelamento', async () => {
    const fetchMock = stubBackend(() => ({ ok: true, body: suggestionsResponse([bomJesusPiaui, recife]) }));
    await expect(fetchLocationSuggestions('Bom', signal)).resolves.toEqual(suggestionsResponse([bomJesusPiaui, recife]));
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('http://localhost:3001/locations?query=Bom');
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({ signal });
  });

  it('aceita lista vazia como resultado válido', async () => {
    stubBackend(() => ({ ok: true, body: suggestionsResponse([]) }));
    await expect(fetchLocationSuggestions('zzzz', signal)).resolves.toEqual(suggestionsResponse([]));
  });

  it.each([
    ['sem lista', { source: suggestionsResponse([]).source }],
    ['com item sem id', suggestionsResponse([{ ...recife, id: 0 }])],
    ['com nome vazio', suggestionsResponse([{ ...recife, name: ' ' }])],
    ['com estado não textual', { ...suggestionsResponse([]), suggestions: [{ ...recife, admin1: 7 }] }],
    ['com mais de oito itens', suggestionsResponse(Array.from({ length: 9 }, (_, index) => ({ ...recife, id: index + 1 })))],
    ['sem atribuição', { suggestions: [] }],
  ])('converte envelope inválido (%s) em erro apresentável', async (_case, body) => {
    stubBackend(() => ({ ok: true, body }));
    await expect(fetchLocationSuggestions('Recife', signal)).rejects.toEqual(unavailable);
  });

  it('traduz query recusada pelo backend em orientação de validação', async () => {
    stubBackend(() => ({ ok: false, body: { error: { code: 'INVALID_LOCATION_QUERY', message: 'x' } } }));
    await expect(fetchLocationSuggestions('A', signal)).rejects.toMatchObject({ kind: 'validation' });
  });

  it('traduz indisponibilidade e códigos desconhecidos em erro recuperável', async () => {
    stubBackend(() => ({ ok: false, body: { error: { code: 'OUTRO' } } }));
    await expect(fetchLocationSuggestions('Recife', signal)).rejects.toEqual(unavailable);
  });

  it('traduz falha de rede em erro recuperável', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await expect(fetchLocationSuggestions('Recife', signal)).rejects.toEqual(unavailable);
  });

  it('propaga o cancelamento sem convertê-lo em falha apresentável', async () => {
    const controller = new AbortController();
    controller.abort();
    const abortError = new DOMException('aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));
    await expect(fetchLocationSuggestions('Recife', controller.signal)).rejects.toBe(abortError);
  });
});
