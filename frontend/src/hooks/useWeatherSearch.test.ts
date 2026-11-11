import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather } from '../services/weather-service';
import { weatherResponse } from '../test/weather-fixtures';
import { useWeatherSearch } from './useWeatherSearch';

vi.mock('../services/weather-service', () => ({ fetchWeather: vi.fn() }));

const mockedFetchWeather = vi.mocked(fetchWeather);

beforeEach(() => vi.resetAllMocks());

describe('useWeatherSearch', () => {
  it('moves from idle to success after a weather response', async () => {
    mockedFetchWeather.mockResolvedValue(weatherResponse);
    const { result } = renderHook(() => useWeatherSearch());

    expect(result.current.state).toEqual({ status: 'idle' });
    await act(async () => result.current.search('Lisboa'));

    expect(result.current.state).toEqual({ status: 'success', data: weatherResponse });
    expect(mockedFetchWeather).toHaveBeenCalledWith('Lisboa', expect.any(AbortSignal));
  });

  it('keeps a structured weather error from the service', async () => {
    mockedFetchWeather.mockRejectedValue({ kind: 'not-found', message: 'Cidade não encontrada.' });
    const { result } = renderHook(() => useWeatherSearch());

    await act(async () => result.current.search('Atlantis'));

    expect(result.current.state).toEqual({
      status: 'error',
      error: { kind: 'not-found', message: 'Cidade não encontrada.' },
    });
  });

  it('uses the fallback message for an unexpected service error', async () => {
    mockedFetchWeather.mockRejectedValue(new Error('unexpected'));
    const { result } = renderHook(() => useWeatherSearch());

    await act(async () => result.current.search('Lisboa'));

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
      void result.current.search('Lisboa');
    });
    await waitFor(() => expect(result.current.state.status).toBe('loading'));
    await act(async () => result.current.search('Porto'));
    expect(mockedFetchWeather).toHaveBeenCalledTimes(1);

    await act(async () => finishSearch?.(weatherResponse));
    expect(result.current.state.status).toBe('success');
  });

  it('aborts the active request when the hook unmounts', async () => {
    let requestSignal: AbortSignal | undefined;
    mockedFetchWeather.mockImplementation((_city, signal) => {
      requestSignal = signal;
      return new Promise(() => undefined);
    });
    const { result, unmount } = renderHook(() => useWeatherSearch());

    act(() => {
      void result.current.search('Lisboa');
    });
    await waitFor(() => expect(requestSignal).toBeDefined());
    unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
