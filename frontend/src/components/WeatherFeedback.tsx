import { useLanguage } from '../hooks/useLanguage';
import { interpolate } from '../i18n/interpolate';
import { formatLocation } from '../services/weather-formatters';
import type { WeatherSearchState } from '../types/weather-search-state';

type WeatherFeedbackProps = {
  state: WeatherSearchState;
};

export function WeatherFeedback({ state }: WeatherFeedbackProps) {
  const { messages } = useLanguage();
  const successMessage = state.status === 'success'
    ? interpolate(messages.feedback.success, { location: formatLocation(state.data.location) })
    : '';
  return <>
    <p role="status" aria-live="polite" className="text-sm font-medium text-[#1b6172]">
      {state.status === 'loading' && messages.feedback.loading}
      <span className="sr-only">{successMessage}</span>
    </p>
    {state.status === 'error' && <p role="alert" className="text-sm font-medium text-red-800">{messages.errors[state.error.kind]}</p>}
  </>;
}
