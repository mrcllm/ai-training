import type { CurrentConditions } from './current-conditions';
import type { WeatherUnits } from './weather-units';

export type ProviderConditions = {
  current: CurrentConditions;
  units: WeatherUnits;
};
