import { useId, useRef } from 'react';
import { useLocationAutocomplete } from '../hooks/useLocationAutocomplete';
import { suggestionOptionId } from '../services/location-formatters';
import { LocationSuggestionFeedback } from './LocationSuggestionFeedback';
import { LocationSuggestionsPanel } from './LocationSuggestionsPanel';
import type { LocationSuggestion } from '../types/location-suggestion';

type LocationAutocompleteProps = {
  value: string;
  selectedLocation: LocationSuggestion | null;
  error: string | null;
  disabled: boolean;
  onValueChange: (value: string) => void;
  onSelect: (suggestion: LocationSuggestion) => void;
};

export function LocationAutocomplete({ value, selectedLocation, error, disabled, onValueChange, onSelect }: LocationAutocompleteProps) {
  const model = useLocationAutocomplete({ value, selectedLocation, onValueChange, onSelect });
  const baseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const retry = (): void => {
    model.retry();
    inputRef.current?.focus();
  };
  const activeOption = model.options[model.activeIndex];
  const describedBy = [error ? `${baseId}-error` : '', `${baseId}-feedback`].filter(Boolean).join(' ');
  return <div className="min-w-0 flex-1">
    <label htmlFor={`${baseId}-input`} className="mb-2 block text-sm font-semibold text-slate-800">Cidade</label>
    <div className="relative">
      <input ref={inputRef} id={`${baseId}-input`} name="city" role="combobox" aria-autocomplete="list" aria-expanded={model.isOpen}
        aria-controls={model.isOpen ? `${baseId}-listbox` : undefined}
        aria-activedescendant={activeOption ? suggestionOptionId(`${baseId}-listbox`, activeOption) : undefined}
        aria-invalid={error !== null} aria-describedby={describedBy} value={value} readOnly={disabled} autoComplete="off" placeholder="Ex.: São Paulo"
        onChange={(event) => model.handleChange(event.target.value)} onKeyDown={model.handleKeyDown} onBlur={model.handleBlur}
        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 placeholder:text-slate-500 focus-visible:border-[#1b6172] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6172] read-only:bg-slate-100" />
      <LocationSuggestionsPanel listboxId={`${baseId}-listbox`} state={model.state} isOpen={model.isOpen} activeIndex={model.activeIndex} onSelect={model.select} />
    </div>
    {error && <p id={`${baseId}-error`} role="alert" className="mt-2 text-sm font-medium text-red-800">{error}</p>}
    <LocationSuggestionFeedback id={`${baseId}-feedback`} state={model.state} onRetry={retry} />
  </div>;
}
