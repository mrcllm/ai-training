import { useState, type FormEvent } from 'react';
import { formatSuggestionLabel } from '../services/location-formatters';
import type { LocationSuggestion } from '../types/location-suggestion';

const SELECTION_REQUIRED = 'Selecione uma localidade na lista de sugestões antes de consultar o clima.';

type LocationSelectionInput = {
  isLoading: boolean;
  onSearch: (locationId: number) => void;
  onInvalid: () => void;
};

export function useLocationSelection({ isLoading, onSearch, onInvalid }: LocationSelectionInput) {
  const [value, setValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const changeValue = (next: string): void => {
    setValue(next);
    setSelectedLocation(null);
    setError(null);
  };
  const select = (suggestion: LocationSuggestion): void => {
    setValue(formatSuggestionLabel(suggestion));
    setSelectedLocation(suggestion);
    setError(null);
  };
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isLoading) return;
    if (selectedLocation === null) {
      setError(SELECTION_REQUIRED);
      onInvalid();
      return;
    }
    onSearch(selectedLocation.id);
  };
  return { value, selectedLocation, error, changeValue, select, submit };
}
