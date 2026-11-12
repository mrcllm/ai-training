import { useCallback, useEffect, useState } from 'react';
import { isSearchableQuery, normalizeLocationQuery } from '../services/location-formatters';
import { fetchLocationSuggestions, isUiLocationError } from '../services/location-service';
import type { LocationSearchState } from '../types/location-search-state';
import type { LocationSuggestionsController } from '../types/location-suggestions-controller';
import type { LocationSuggestionsResponse } from '../types/location-suggestions-response';
import type { UiLocationError } from '../types/ui-location-error';

export const SUGGESTIONS_DEBOUNCE_MS = 300;
const IDLE_STATE: LocationSearchState = { status: 'idle' };
const DEFAULT_ERROR: UiLocationError = {
  kind: 'unavailable',
  message: 'Não foi possível buscar localidades agora. Tente novamente.',
};

function toResultState(query: string, response: LocationSuggestionsResponse): LocationSearchState {
  if (response.suggestions.length === 0) return { status: 'empty', query, source: response.source };
  return { status: 'success', query, data: response.suggestions, source: response.source };
}

function toErrorState(query: string, error: unknown): LocationSearchState {
  return { status: 'error', query, error: isUiLocationError(error) ? error : DEFAULT_ERROR };
}

function belongsTo(state: LocationSearchState, query: string): boolean {
  return state.status !== 'idle' && state.query === query;
}

export function useLocationSuggestions(rawQuery: string): LocationSuggestionsController {
  const query = normalizeLocationQuery(rawQuery);
  const isSearchable = isSearchableQuery(query);
  const [state, setState] = useState<LocationSearchState>(IDLE_STATE);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!isSearchable) return undefined;
    const controller = new AbortController();
    const settle = (next: LocationSearchState): void => {
      if (!controller.signal.aborted) setState(next);
    };
    const timer = setTimeout(() => {
      settle({ status: 'loading', query });
      fetchLocationSuggestions(query, controller.signal).then(
        (response) => settle(toResultState(query, response)),
        (error: unknown) => settle(toErrorState(query, error)),
      );
    }, SUGGESTIONS_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isSearchable, attempt]);
  const retry = useCallback((): void => setAttempt((current) => current + 1), []);
  return { state: isSearchable && belongsTo(state, query) ? state : IDLE_STATE, retry };
}
