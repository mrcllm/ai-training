import { useLanguage } from '../hooks/useLanguage';
import type { UiWeatherError } from '../types/api-error';

type WeatherFeedbackProps = {
  isLoading: boolean;
  error?: UiWeatherError;
};

export function WeatherFeedback({ isLoading, error }: WeatherFeedbackProps) {
  const { messages } = useLanguage();
  if (isLoading) return <p role="status" aria-live="polite" aria-busy="true" className="text-sm font-medium text-[#1b6172]">{messages.feedback.loading}</p>;
  if (error) return <p role="alert" className="text-sm font-medium text-red-800">{messages.errors[error.kind]}</p>;
  return null;
}
