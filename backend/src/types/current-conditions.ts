import type { WeatherCondition } from './weather-condition';

export type CurrentConditions = {
  temperature: number;
  apparentTemperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
};
