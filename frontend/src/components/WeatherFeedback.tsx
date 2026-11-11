import type { UiWeatherError } from '../types/api-error';

type WeatherFeedbackProps = {
  isLoading: boolean;
  error?: UiWeatherError;
};

export function WeatherFeedback({ isLoading, error }: WeatherFeedbackProps) {
  if (isLoading) return <p role="status" aria-live="polite" aria-busy="true" className="text-sm font-medium text-[#1b6172]">Consultando as condições atuais…</p>;
  if (error) return <p role="alert" className="text-sm font-medium text-red-800">{error.message}</p>;
  return null;
}
