import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather } from '../services/weather-service';
import { weatherResponse } from '../test/weather-fixtures';
import { useWeatherSearch } from './useWeatherSearch';

vi.mock('../services/weather-service', () => ({ fetchWeather: vi.fn() }));

const mockedFetchWeather = vi.mocked(fetchWeather);

beforeEach(() => vi.resetAllMocks());

describe('useWeatherSearch (TU-15)', () => {
  it('moves from idle to success after a weather response', async () => {
    mockedFetchWeather.mockResolvedValue(weatherResponse);
    const { result } = renderHook(() => useWeatherSearch());

    expect(result.current.state).toEqual({ status: 'idle' });
    await act(async () => result.current.search(3405940));

    expect(result.current.state).toEqual({ status: 'success', data: weatherResponse });
    expect(mockedFetchWeather).toHaveBeenCalledWith(3405940, expect.any(AbortSignal));
  });

  it('keeps a structured weather error from the service', async () => {
    mockedFetchWeather.mockRejectedValue({ kind: 'not-found', message: 'Cidade não encontrada.' });
    const { result } = renderHook(() => useWeatherSearch());

    await act(async () => result.current.search(1));

    expect(result.current.state).toEqual({
      status: 'error',
      error: { kind: 'not-found', message: 'Cidade não encontrada.' },
    });
  });

  it('uses the fallback message for an unexpected service error', async () => {
    mockedFetchWeather.mockRejectedValue(new Error('unexpected'));
    const { result } = renderHook(() => useWeatherSearch());

    await act(async () => result.current.search(3405940));

    expect(result.current.state).toEqual({
      status: 'error',
      error: {
        kind: 'unavailable',
        message: 'Não foi possível consultar o clima agora. Tente novamente em instantes.',
      },
    });
  });

  it('ignores a second search while the first search is active', async () => {
    let finishSearch: ((value: typeof weatherResponse) => void) | undefined;
    mockedFetchWeather.mockImplementation(() => new Promise((resolve) => { finishSearch = resolve; }));
    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      void result.current.search(3405940);
    });
    await waitFor(() => expect(result.current.state.status).toBe('loading'));
    await act(async () => result.current.search(3469136));
    expect(mockedFetchWeather).toHaveBeenCalledTimes(1);

    await act(async () => finishSearch?.(weatherResponse));
    expect(result.current.state.status).toBe('success');
  });

  it('volta ao estado inicial ao limpar um resultado anterior (BUG-01)', async () => {
    mockedFetchWeather.mockResolvedValue(weatherResponse);
    const { result } = renderHook(() => useWeatherSearch());
    await act(async () => result.current.search(3405940));
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('não interrompe uma busca em andamento ao limpar', async () => {
    mockedFetchWeather.mockImplementation(() => new Promise(() => undefined));
    const { result } = renderHook(() => useWeatherSearch());
    act(() => {
      void result.current.search(3405940);
    });
    await waitFor(() => expect(result.current.state.status).toBe('loading'));
    act(() => result.current.reset());
    expect(result.current.state.status).toBe('loading');
  });

  it('aborts the active request when the hook unmounts', async () => {
    let requestSignal: AbortSignal | undefined;
    mockedFetchWeather.mockImplementation((_locationId, signal) => {
      requestSignal = signal;
      return new Promise(() => undefined);
    });
    const { result, unmount } = renderHook(() => useWeatherSearch());

    act(() => {
      void result.current.search(3405940);
    });
    await waitFor(() => expect(requestSignal).toBeDefined());
    unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
