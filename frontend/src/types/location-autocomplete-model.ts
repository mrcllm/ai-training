import type { KeyboardEvent } from 'react';
import type { LocationSearchState } from './location-search-state';
import type { LocationSuggestion } from './location-suggestion';

export type LocationAutocompleteInput = {
  value: string;
  selectedLocation: LocationSuggestion | null;
  onValueChange: (value: string) => void;
  onSelect: (suggestion: LocationSuggestion) => void;
};

export type LocationAutocompleteModel = {
  state: LocationSearchState;
  retry: () => void;
  options: LocationSuggestion[];
  activeIndex: number;
  isOpen: boolean;
  handleChange: (value: string) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  select: (suggestion: LocationSuggestion) => void;
};
