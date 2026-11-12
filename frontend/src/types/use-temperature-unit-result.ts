import type { TemperatureUnit } from './temperature-unit';

export type UseTemperatureUnitResult = {
  unit: TemperatureUnit;
  toggleUnit: () => void;
};
