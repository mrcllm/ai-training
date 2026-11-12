import { formatLocation } from '../services/weather-formatters';
import type { WeatherSearchState } from '../types/weather-search-state';

type WeatherFeedbackProps = {
  state: WeatherSearchState;
};

const LOADING_MESSAGE = 'Consultando as condições atuais…';

function describeSuccess(state: WeatherSearchState): string {
  return state.status === 'success' ? `Condições atuais carregadas para ${formatLocation(state.data.location)}.` : '';
}

export function WeatherFeedback({ state }: WeatherFeedbackProps) {
  return <>
    <p role="status" aria-live="polite" className="text-sm font-medium text-[#1b6172]">
      {state.status === 'loading' && LOADING_MESSAGE}
      <span className="sr-only">{describeSuccess(state)}</span>
    </p>
    {state.status === 'error' && <p role="alert" className="text-sm font-medium text-red-800">{state.error.message}</p>}
  </>;
}
