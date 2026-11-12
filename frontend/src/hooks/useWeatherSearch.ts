import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather } from '../services/weather-service';
import type { UiWeatherError } from '../types/api-error';
import type { WeatherSearchState } from '../types/weather-search-state';

const DEFAULT_ERROR: UiWeatherError = { kind: 'unavailable' };
const WEATHER_ERROR_KINDS = { validation: true, 'not-found': true, unavailable: true } as const satisfies Record<UiWeatherError['kind'], true>;

export function useWeatherSearch(): { state: WeatherSearchState; search: (city: string) => Promise<void> } {
  const [state, setState] = useState<WeatherSearchState>({ status: 'idle' });
  const activeRequest = useRef<AbortController | null>(null);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      activeRequest.current?.abort();
    };
  }, []);
  const search = useCallback(async (city: string): Promise<void> => {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setState({ status: 'loading' });
    try {
      const data = await fetchWeather(city, controller.signal);
      if (isMounted.current && !controller.signal.aborted) setState({ status: 'success', data });
    } catch (error) {
      if (!isMounted.current || controller.signal.aborted) return;
      setState({ status: 'error', error: isWeatherError(error) ? error : DEFAULT_ERROR });
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }, []);
  return { state, search };
}

function isWeatherError(value: unknown): value is UiWeatherError {
  if (typeof value !== 'object' || value === null || !('kind' in value)) return false;
  const { kind } = value;
  return typeof kind === 'string' && Object.hasOwn(WEATHER_ERROR_KINDS, kind);
}
