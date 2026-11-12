import { AppError } from './app-error';
import type { ApiErrorCode } from '../types/api-error';
import type { AppErrorLogLevel } from '../types/app-error-log-level';

const SERVICE_UNAVAILABLE_STATUS = 503;
const LOCATION_MESSAGE = 'Não foi possível buscar localidades agora. Tente novamente.';
const WEATHER_MESSAGE = 'Não foi possível consultar o clima agora. Tente novamente em instantes.';

type ProviderFailure = {
  detail: string;
  logLevel: AppErrorLogLevel;
  outcome: string;
};

function providerError(code: ApiErrorCode, publicMessage: string, failure: ProviderFailure): AppError {
  return new AppError({ statusCode: SERVICE_UNAVAILABLE_STATUS, code, publicMessage, ...failure });
}

function locationFailure(failure: ProviderFailure): AppError {
  return providerError('LOCATION_PROVIDER_UNAVAILABLE', LOCATION_MESSAGE, failure);
}

function weatherFailure(failure: ProviderFailure): AppError {
  return providerError('WEATHER_PROVIDER_UNAVAILABLE', WEATHER_MESSAGE, failure);
}

export function locationProviderUnavailable(detail: string): AppError {
  return locationFailure({ detail, logLevel: 'warn', outcome: 'external_failure' });
}

export function locationProviderAborted(detail: string): AppError {
  return locationFailure({ detail, logLevel: 'warn', outcome: 'aborted' });
}

export function invalidLocationProviderPayload(detail: string): AppError {
  return locationFailure({ detail, logLevel: 'error', outcome: 'invalid_payload' });
}

export function unexpectedLocationProviderFailure(detail: string): AppError {
  return locationFailure({ detail, logLevel: 'error', outcome: 'internal_error' });
}

export function weatherProviderUnavailable(detail: string): AppError {
  return weatherFailure({ detail, logLevel: 'warn', outcome: 'external_failure' });
}

export function weatherProviderAborted(detail: string): AppError {
  return weatherFailure({ detail, logLevel: 'warn', outcome: 'aborted' });
}

export function invalidWeatherProviderPayload(detail: string): AppError {
  return weatherFailure({ detail, logLevel: 'error', outcome: 'invalid_payload' });
}

export function unexpectedWeatherProviderFailure(detail: string): AppError {
  return weatherFailure({ detail, logLevel: 'error', outcome: 'internal_error' });
}
