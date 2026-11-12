import type { ApiErrorCode } from './api-error';
import type { AppErrorLogLevel } from './app-error-log-level';

export type AppErrorInput = {
  statusCode: number;
  code: ApiErrorCode;
  publicMessage: string;
  detail?: string;
  logLevel?: AppErrorLogLevel;
  outcome?: string;
};
