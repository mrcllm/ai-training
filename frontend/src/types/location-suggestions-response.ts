import type { LocationSuggestion } from './location-suggestion';
import type { SourceAttribution } from './source-attribution';

export type LocationSuggestionsResponse = {
  suggestions: LocationSuggestion[];
  source: SourceAttribution;
};
