import type { LocationSuggestion } from './location-suggestion';
import type { SourceAttribution } from './source-attribution';
import type { UiLocationError } from './ui-location-error';

export type LocationSearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; data: LocationSuggestion[]; source: SourceAttribution }
  | { status: 'empty'; query: string; source: SourceAttribution }
  | { status: 'error'; query: string; error: UiLocationError };
