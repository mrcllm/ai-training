import { useState, type FormEvent } from 'react';
import { formatSuggestionLabel } from '../services/location-formatters';
import type { LocationSuggestion } from '../types/location-suggestion';

type LocationSelectionInput = {
  isLoading: boolean;
  onSearch: (locationId: number) => void;
  onInvalid: () => void;
};

export function useLocationSelection({ isLoading, onSearch, onInvalid }: LocationSelectionInput) {
  const [value, setValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [isSelectionMissing, setIsSelectionMissing] = useState(false);
  const changeValue = (next: string): void => {
    setValue(next);
    setSelectedLocation(null);
    setIsSelectionMissing(false);
  };
  const select = (suggestion: LocationSuggestion): void => {
    setValue(formatSuggestionLabel(suggestion));
    setSelectedLocation(suggestion);
    setIsSelectionMissing(false);
  };
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isLoading) return;
    if (selectedLocation === null) {
      setIsSelectionMissing(true);
      onInvalid();
      return;
    }
    onSearch(selectedLocation.id);
  };
  return { value, selectedLocation, isSelectionMissing, changeValue, select, submit };
}
