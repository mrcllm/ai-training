import { useEffect, useRef } from 'react';
import { suggestionOptionId } from '../services/location-formatters';
import type { LocationSuggestion } from '../types/location-suggestion';

type LocationSuggestionsListProps = {
  listboxId: string;
  suggestions: LocationSuggestion[];
  activeIndex: number;
  onSelect: (suggestion: LocationSuggestion) => void;
};

type LocationOptionProps = {
  id: string;
  suggestion: LocationSuggestion;
  isActive: boolean;
  onSelect: (suggestion: LocationSuggestion) => void;
};

export function LocationSuggestionsList({ listboxId, suggestions, activeIndex, onSelect }: LocationSuggestionsListProps) {
  return <ul id={listboxId} role="listbox" aria-label="Sugestões de localidade" className="max-h-72 overflow-y-auto p-1">
    {suggestions.map((suggestion, index) => <LocationOption key={suggestion.id} id={suggestionOptionId(listboxId, suggestion)}
      suggestion={suggestion} isActive={index === activeIndex} onSelect={onSelect} />)}
  </ul>;
}

function LocationOption({ id, suggestion, isActive, onSelect }: LocationOptionProps) {
  const optionRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (isActive) optionRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [isActive]);
  return <li ref={optionRef} id={id} role="option" aria-selected={isActive} onMouseDown={(event) => event.preventDefault()}
    onClick={() => onSelect(suggestion)}
    className="flex cursor-pointer flex-col rounded-lg px-3 py-2 text-left hover:bg-[#f3f7f7] aria-selected:bg-[#e3eff1] aria-selected:ring-2 aria-selected:ring-inset aria-selected:ring-[#1b6172]">
    <span className="font-semibold text-slate-950">{suggestion.name}</span>
    {(suggestion.admin1 ?? suggestion.country) && <span className="text-sm text-slate-600">{[suggestion.admin1, suggestion.country].filter(Boolean).join(', ')}</span>}
  </li>;
}
