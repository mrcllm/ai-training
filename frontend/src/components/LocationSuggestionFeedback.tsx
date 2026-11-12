import type { LocationSearchState } from '../types/location-search-state';

type LocationSuggestionFeedbackProps = {
  id: string;
  state: LocationSearchState;
  onRetry: () => void;
};

function describeState(state: LocationSearchState): string {
  if (state.status === 'loading') return 'Buscando localidades…';
  if (state.status === 'empty') return 'Nenhuma localidade encontrada. Revise o texto digitado.';
  if (state.status !== 'success') return '';
  const noun = state.data.length === 1 ? 'localidade encontrada' : 'localidades encontradas';
  return `${state.data.length} ${noun}. Use as setas para escolher e Enter para selecionar.`;
}

export function LocationSuggestionFeedback({ id, state, onRetry }: LocationSuggestionFeedbackProps) {
  return <div className="mt-2 text-sm">
    <p id={id} role="status" aria-live="polite" className={state.status === 'success' ? 'sr-only' : 'text-slate-600'}>{describeState(state)}</p>
    {state.status === 'error' && <div className="flex flex-wrap items-center gap-2">
      <p role="alert" className="font-medium text-red-800">{state.error.message}</p>
      {state.error.kind === 'unavailable' && <button type="button" onClick={onRetry}
        className="rounded-md font-semibold text-[#14596a] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6172]">Tentar novamente</button>}
    </div>}
  </div>;
}
