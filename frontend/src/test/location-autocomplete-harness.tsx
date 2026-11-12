import { useState } from 'react';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { formatSuggestionLabel } from '../services/location-formatters';
import type { LocationSuggestion } from '../types/location-suggestion';

type HarnessProps = {
  onSelect: (suggestion: LocationSuggestion) => void;
};

export function LocationAutocompleteHarness({ onSelect }: HarnessProps) {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<LocationSuggestion | null>(null);
  const select = (suggestion: LocationSuggestion) => {
    setValue(formatSuggestionLabel(suggestion));
    setSelected(suggestion);
    onSelect(suggestion);
  };
  const change = (next: string) => {
    setValue(next);
    setSelected(null);
  };
  return <>
    <LocationAutocomplete value={value} selectedLocation={selected} error={null} disabled={false} onValueChange={change} onSelect={select} />
    <button type="button">Próximo controle</button>
  </>;
}
