import { SourceAttribution } from './SourceAttribution';
import { LocationSuggestionsList } from './LocationSuggestionsList';
import type { LocationSearchState } from '../types/location-search-state';
import type { LocationSuggestion } from '../types/location-suggestion';

type LocationSuggestionsPanelProps = {
  listboxId: string;
  state: LocationSearchState;
  isOpen: boolean;
  activeIndex: number;
  onSelect: (suggestion: LocationSuggestion) => void;
};

export function LocationSuggestionsPanel({ listboxId, state, isOpen, activeIndex, onSelect }: LocationSuggestionsPanelProps) {
  if (!isOpen || state.status !== 'success') return null;
  return <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(22,63,75,0.16)]">
    <LocationSuggestionsList listboxId={listboxId} suggestions={state.data} activeIndex={activeIndex} onSelect={onSelect} />
    <div className="px-4 pb-3" onMouseDown={(event) => event.preventDefault()}>
      <SourceAttribution label="Localidades por" name={state.source.name} url={state.source.url} />
    </div>
  </div>;
}
