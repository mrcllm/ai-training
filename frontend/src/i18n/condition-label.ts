import type { Messages } from '../types/messages';
import type { WeatherConditionCode } from '../types/weather-condition-code';
import type { WeatherResponse } from '../types/weather-response';
import { ptBrConditions } from './locales/pt-br-conditions';

export function isWeatherConditionCode(code: number): code is WeatherConditionCode {
  return Object.hasOwn(ptBrConditions, code);
}

export function getConditionLabel(condition: WeatherResponse['current']['condition'], labels: Messages['conditions']): string {
  if (!isWeatherConditionCode(condition.code)) return condition.label;
  return labels[condition.code];
}
