import type { LocationSuggestion } from '../types/location-suggestion';
import type { LocationSuggestionsResponse } from '../types/location-suggestions-response';

export const bomJesusPiaui: LocationSuggestion = { id: 3405940, name: 'Bom Jesus', admin1: 'Piauí', country: 'Brasil' };
export const bomJesusRioGrande: LocationSuggestion = { id: 3469136, name: 'Bom Jesus', admin1: 'Rio Grande do Sul', country: 'Brasil' };
export const recife: LocationSuggestion = { id: 3390760, name: 'Recife', admin1: null, country: 'Brasil' };

export function suggestionsResponse(suggestions: LocationSuggestion[]): LocationSuggestionsResponse {
  return { suggestions, source: { name: 'Open-Meteo', url: 'https://open-meteo.com/' } };
}

export const lisboa: LocationSuggestion = { id: 2267057, name: 'Lisboa', admin1: 'Lisboa', country: 'Portugal' };
export const porto: LocationSuggestion = { id: 2735943, name: 'Porto', admin1: 'Porto', country: 'Portugal' };
export const atlantis: LocationSuggestion = { id: 9999001, name: 'Atlantis', admin1: null, country: 'Oceano' };
const KNOWN_LOCATIONS: LocationSuggestion[] = [lisboa, porto, atlantis, bomJesusPiaui, bomJesusRioGrande, recife];

export function findSuggestions(query: string | null): LocationSuggestionsResponse {
  const prefix = (query ?? '').toLocaleLowerCase('pt-BR');
  return suggestionsResponse(KNOWN_LOCATIONS.filter((location) => location.name.toLocaleLowerCase('pt-BR').startsWith(prefix)));
}
