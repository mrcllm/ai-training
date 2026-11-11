import type { ApiErrorCode } from '../types/api-error';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ApiErrorCode,
    public readonly publicMessage: string,
    message = publicMessage,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
