import { AppError } from '../errors/app-error';

const PUBLIC_MESSAGE = 'O serviço de clima está temporariamente indisponível.';

export function providerUnavailable(message: string): AppError {
  return new AppError(503, 'WEATHER_PROVIDER_UNAVAILABLE', PUBLIC_MESSAGE, message);
}
