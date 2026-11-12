export type ApiErrorCode =
  | 'INVALID_LOCATION_QUERY'
  | 'INVALID_LOCATION_ID'
  | 'LOCATION_NOT_FOUND'
  | 'LOCATION_PROVIDER_UNAVAILABLE'
  | 'WEATHER_PROVIDER_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'INTERNAL_ERROR';

export type ApiError = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
