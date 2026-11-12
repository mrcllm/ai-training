import type { LocationSuggestion } from '../types/location-suggestion';
import type { LocationSuggestionsResponse } from '../types/location-suggestions-response';

export const bomJesusPiaui: LocationSuggestion = { id: 3405940, name: 'Bom Jesus', admin1: 'Piauí', country: 'Brasil' };
export const bomJesusRioGrande: LocationSuggestion = { id: 3469136, name: 'Bom Jesus', admin1: 'Rio Grande do Sul', country: 'Brasil' };
export const recife: LocationSuggestion = { id: 3390760, name: 'Recife', admin1: null, country: 'Brasil' };

export function suggestionsResponse(suggestions: LocationSuggestion[]): LocationSuggestionsResponse {
  return { suggestions, source: { name: 'Open-Meteo', url: 'https://open-meteo.com/' } };
}
