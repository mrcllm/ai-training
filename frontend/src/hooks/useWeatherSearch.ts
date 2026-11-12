import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { fetchWeather } from '../services/weather-service';
import type { UiWeatherError } from '../types/api-error';
import type { WeatherSearchController } from '../types/weather-search-controller';
import type { WeatherSearchState } from '../types/weather-search-state';

const DEFAULT_ERROR: UiWeatherError = { kind: 'unavailable' };
const WEATHER_ERROR_KINDS = { validation: true, 'not-found': true, unavailable: true } as const satisfies Record<UiWeatherError['kind'], true>;

function useUnmountGuard(onUnmount: () => void): RefObject<boolean> {
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      onUnmount();
    };
  }, [onUnmount]);
  return isMounted;
}

export function useWeatherSearch(): WeatherSearchController {
  const [state, setState] = useState<WeatherSearchState>({ status: 'idle' });
  const activeRequest = useRef<AbortController | null>(null);
  const abortActiveRequest = useCallback((): void => activeRequest.current?.abort(), []);
  const isMounted = useUnmountGuard(abortActiveRequest);
  const search = useCallback(async (locationId: number): Promise<void> => {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setState({ status: 'loading' });
    try {
      const data = await fetchWeather(locationId, controller.signal);
      if (isMounted.current && !controller.signal.aborted) setState({ status: 'success', data });
    } catch (error) {
      if (!isMounted.current || controller.signal.aborted) return;
      setState({ status: 'error', error: isWeatherError(error) ? error : DEFAULT_ERROR });
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }, [isMounted]);
  const reset = useCallback((): void => {
    if (!activeRequest.current) setState({ status: 'idle' });
  }, []);
  return { state, search, reset };
}

function isWeatherError(value: unknown): value is UiWeatherError {
  if (typeof value !== 'object' || value === null || !('kind' in value)) return false;
  const { kind } = value;
  return typeof kind === 'string' && Object.hasOwn(WEATHER_ERROR_KINDS, kind);
}
