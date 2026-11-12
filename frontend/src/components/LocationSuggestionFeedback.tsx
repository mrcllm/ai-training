import { useLanguage } from '../hooks/useLanguage';
import { interpolate } from '../i18n/interpolate';
import type { LocationSearchState } from '../types/location-search-state';
import type { Messages } from '../types/messages';

type LocationSuggestionFeedbackProps = {
  id: string;
  state: LocationSearchState;
  onRetry: () => void;
};

function describeState(state: LocationSearchState, texts: Messages['locationSearch']): string {
  if (state.status === 'loading') return texts.loading;
  if (state.status === 'empty') return texts.empty;
  if (state.status !== 'success') return '';
  if (state.data.length === 1) return texts.foundOne;
  return interpolate(texts.foundMany, { count: state.data.length });
}

export function LocationSuggestionFeedback({ id, state, onRetry }: LocationSuggestionFeedbackProps) {
  const { messages } = useLanguage();
  return <div className="mt-2 text-sm">
    <p id={id} role="status" aria-live="polite" className={state.status === 'success' ? 'sr-only' : 'text-slate-600'}>{describeState(state, messages.locationSearch)}</p>
    {state.status === 'error' && <div className="flex flex-wrap items-center gap-2">
      <p role="alert" className="font-medium text-red-800">{messages.locationErrors[state.error.kind]}</p>
      {state.error.kind === 'unavailable' && <button type="button" onClick={onRetry}
        className="rounded-md font-semibold text-[#14596a] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6172]">{messages.locationSearch.retry}</button>}
    </div>}
  </div>;
}
