import { useComboboxNavigation } from './useComboboxNavigation';
import { useLocationSuggestions } from './useLocationSuggestions';
import type { LocationAutocompleteInput, LocationAutocompleteModel } from '../types/location-autocomplete-model';
import type { LocationSuggestion } from '../types/location-suggestion';

const NO_SUGGESTIONS: LocationSuggestion[] = [];

export function useLocationAutocomplete(input: LocationAutocompleteInput): LocationAutocompleteModel {
  const { state, retry } = useLocationSuggestions(input.selectedLocation === null ? input.value : '');
  const options = state.status === 'success' ? state.data : NO_SUGGESTIONS;
  const select = (suggestion: LocationSuggestion): void => input.onSelect(suggestion);
  const navigation = useComboboxNavigation({
    optionCount: options.length,
    onSelectIndex: (index) => select(options[index]),
  });
  const handleChange = (value: string): void => {
    navigation.reset();
    input.onValueChange(value);
  };
  const retrySearch = (): void => {
    navigation.reset();
    retry();
  };
  return {
    state,
    retry: retrySearch,
    options,
    activeIndex: navigation.activeIndex,
    isOpen: navigation.isOpen,
    handleChange,
    handleKeyDown: navigation.handleKeyDown,
    handleBlur: navigation.close,
    select,
  };
}
