import type { ApiErrorCode } from '../types/api-error';
import type { AppErrorInput } from '../types/app-error-input';
import type { AppErrorLogLevel } from '../types/app-error-log-level';

const SERVER_ERROR_STATUS = 500;

export class AppError extends Error {
  public readonly statusCode: number;

  public readonly code: ApiErrorCode;

  public readonly publicMessage: string;

  public readonly logLevel: AppErrorLogLevel;

  public readonly outcome: string;

  constructor(input: AppErrorInput) {
    super(input.detail ?? input.publicMessage);
    this.name = 'AppError';
    this.statusCode = input.statusCode;
    this.code = input.code;
    this.publicMessage = input.publicMessage;
    this.logLevel = input.logLevel ?? (input.statusCode >= SERVER_ERROR_STATUS ? 'error' : 'warn');
    this.outcome = input.outcome ?? input.code.toLowerCase();
  }
}
