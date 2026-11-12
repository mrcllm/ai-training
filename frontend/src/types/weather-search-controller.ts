import type { WeatherSearchState } from './weather-search-state';

export type WeatherSearchController = {
  state: WeatherSearchState;
  search: (locationId: number) => Promise<void>;
  reset: () => void;
};
