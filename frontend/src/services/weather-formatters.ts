import type { Language } from '../types/language';
import type { WeatherResponse } from '../types/weather-response';

const MAX_FRACTION_DIGITS = 1;
const MEASUREMENT_FORMATTERS: Readonly<Record<Language, Intl.NumberFormat>> = {
  'pt-BR': new Intl.NumberFormat('pt-BR', { maximumFractionDigits: MAX_FRACTION_DIGITS }),
  en: new Intl.NumberFormat('en', { maximumFractionDigits: MAX_FRACTION_DIGITS }),
};

export function formatLocation(location: WeatherResponse['location']): string {
  return [location.name, location.admin1, location.country]
    .filter((part): part is string => typeof part === 'string' && part !== '')
    .join(', ');
}

export function formatMeasurement(value: number, unit: string, language: Language): string {
  const withoutNegativeZero = value === 0 ? 0 : value;
  return `${MEASUREMENT_FORMATTERS[language].format(withoutNegativeZero)} ${unit}`;
}
