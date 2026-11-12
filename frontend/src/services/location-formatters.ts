import type { LocationSuggestion } from '../types/location-suggestion';

const SPACES = /\s+/gu;
const MAX_QUERY_CHARACTERS = 100;
export const MIN_QUERY_CHARACTERS = 2;

export function formatSuggestionLabel(suggestion: LocationSuggestion): string {
  return [suggestion.name, suggestion.admin1]
    .filter((part): part is string => typeof part === 'string' && part !== '')
    .join(', ');
}

export function normalizeLocationQuery(value: string): string {
  return value.normalize('NFC').trim().replace(SPACES, ' ');
}

export function isSearchableQuery(query: string): boolean {
  const usefulCharacters = Array.from(query.replace(SPACES, ''));
  return usefulCharacters.length >= MIN_QUERY_CHARACTERS && Array.from(query).length <= MAX_QUERY_CHARACTERS;
}

export function suggestionOptionId(listboxId: string, suggestion: LocationSuggestion): string {
  return `${listboxId}-option-${suggestion.id}`;
}
