export type ApiErrorCode =
  | 'INVALID_CITY'
  | 'CITY_NOT_FOUND'
  | 'WEATHER_PROVIDER_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'INTERNAL_ERROR';

export type ApiError = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
