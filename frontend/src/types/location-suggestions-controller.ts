import type { LocationSearchState } from './location-search-state';

export type LocationSuggestionsController = {
  state: LocationSearchState;
  retry: () => void;
};
