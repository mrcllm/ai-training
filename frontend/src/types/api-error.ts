export type ApiErrorCode =
  | 'INVALID_CITY'
  | 'CITY_NOT_FOUND'
  | 'WEATHER_PROVIDER_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export type UiWeatherError = {
  kind: 'validation' | 'not-found' | 'unavailable';
};
