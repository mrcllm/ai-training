import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchLocationSuggestions } from '../services/location-service';
import { bomJesusPiaui, recife, suggestionsResponse } from '../test/location-fixtures';
import type { LocationSuggestionsResponse } from '../types/location-suggestions-response';
import { SUGGESTIONS_DEBOUNCE_MS, useLocationSuggestions } from './useLocationSuggestions';

vi.mock('../services/location-service', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/location-service')>(),
  fetchLocationSuggestions: vi.fn(),
}));

const mockedFetch = vi.mocked(fetchLocationSuggestions);

type Deferred = { resolve: (value: LocationSuggestionsResponse) => void; signal: AbortSignal };

function deferRequests(): Deferred[] {
  const pending: Deferred[] = [];
  mockedFetch.mockImplementation((_query, signal) => new Promise((resolve) => { pending.push({ resolve, signal }); }));
  return pending;
}

async function advance(milliseconds: number): Promise<void> {
  await act(async () => { await vi.advanceTimersByTimeAsync(milliseconds); });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
});

afterEach(() => vi.useRealTimers());

describe('useLocationSuggestions — debounce e limite mínimo (TU-09)', () => {
  it('não consulta antes de 300 ms desde a última digitação', async () => {
    mockedFetch.mockResolvedValue(suggestionsResponse([recife]));
    renderHook(() => useLocationSuggestions('Rec'));
    await advance(SUGGESTIONS_DEBOUNCE_MS - 1);
    expect(mockedFetch).not.toHaveBeenCalled();
    await advance(1);
    expect(mockedFetch).toHaveBeenCalledWith('Rec', expect.any(AbortSignal));
  });

  it('não consulta abaixo de dois caracteres úteis', async () => {
    renderHook(() => useLocationSuggestions(' a '));
    await advance(SUGGESTIONS_DEBOUNCE_MS * 2);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('reinicia o debounce a cada nova digitação e consulta só a última query normalizada', async () => {
    mockedFetch.mockResolvedValue(suggestionsResponse([recife]));
    const { rerender } = renderHook(({ query }) => useLocationSuggestions(query), { initialProps: { query: 'Re' } });
    await advance(200);
    rerender({ query: '  Recife  ' });
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    expect(mockedFetch).toHaveBeenCalledOnce();
    expect(mockedFetch).toHaveBeenCalledWith('Recife', expect.any(AbortSignal));
  });

  it('mostra loading e depois sucesso para a query ativa', async () => {
    const pending = deferRequests();
    const { result } = renderHook(() => useLocationSuggestions('Bom'));
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    expect(result.current.state).toEqual({ status: 'loading', query: 'Bom' });
    await act(async () => pending[0]?.resolve(suggestionsResponse([bomJesusPiaui])));
    expect(result.current.state).toMatchObject({ status: 'success', query: 'Bom', data: [bomJesusPiaui] });
  });

  it('distingue lista vazia de sucesso', async () => {
    mockedFetch.mockResolvedValue(suggestionsResponse([]));
    const { result } = renderHook(() => useLocationSuggestions('zzzz'));
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    expect(result.current.state).toMatchObject({ status: 'empty', query: 'zzzz' });
  });

  it('limpa o estado imediatamente ao reduzir a entrada abaixo do limite', async () => {
    mockedFetch.mockResolvedValue(suggestionsResponse([recife]));
    const { result, rerender } = renderHook(({ query }) => useLocationSuggestions(query), { initialProps: { query: 'Rec' } });
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    rerender({ query: 'R' });
    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('expõe erro apresentável e permite nova tentativa', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(suggestionsResponse([recife]));
    const { result } = renderHook(() => useLocationSuggestions('Recife'));
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    expect(result.current.state).toMatchObject({ status: 'error', error: { kind: 'unavailable' } });
    act(() => result.current.retry());
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    expect(result.current.state).toMatchObject({ status: 'success', data: [recife] });
  });
});

describe('useLocationSuggestions — respostas obsoletas (TU-10)', () => {
  it('aborta a requisição anterior quando a query muda', async () => {
    const pending = deferRequests();
    const { rerender } = renderHook(({ query }) => useLocationSuggestions(query), { initialProps: { query: 'Bom' } });
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    rerender({ query: 'Bom J' });
    expect(pending[0]?.signal.aborted).toBe(true);
  });

  it('ignora resposta tardia da query anterior mesmo que chegue depois da atual', async () => {
    const pending = deferRequests();
    const { result, rerender } = renderHook(({ query }) => useLocationSuggestions(query), { initialProps: { query: 'Bom' } });
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    rerender({ query: 'Recife' });
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    await act(async () => pending[1]?.resolve(suggestionsResponse([recife])));
    await act(async () => pending[0]?.resolve(suggestionsResponse([bomJesusPiaui])));
    expect(result.current.state).toMatchObject({ status: 'success', query: 'Recife', data: [recife] });
  });

  it('aborta a requisição ativa ao desmontar', async () => {
    const pending = deferRequests();
    const { unmount } = renderHook(() => useLocationSuggestions('Recife'));
    await advance(SUGGESTIONS_DEBOUNCE_MS);
    unmount();
    expect(pending[0]?.signal.aborted).toBe(true);
  });
});
