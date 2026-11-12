export type LogContext = Record<string, string | number | boolean | undefined>;
const SENSITIVE_KEYS = new Set(['city', 'query', 'locationid', 'coordinates', 'payload', 'body', 'stack', 'token', 'authorization', 'password']);

function sanitizeContext(context: LogContext): LogContext {
  return Object.fromEntries(Object.entries(context).filter(([key]) => !SENSITIVE_KEYS.has(key.toLowerCase())));
}

function write(level: 'info' | 'warn' | 'error', event: string, context: LogContext = {}): void {
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...sanitizeContext(context) });
  if (level === 'error') console.error(entry);
  else console.log(entry);
}

export const logger = {
  info(event: string, context?: LogContext): void {
    write('info', event, context);
  },
  warn(event: string, context?: LogContext): void {
    write('warn', event, context);
  },
  error(event: string, context?: LogContext): void {
    write('error', event, context);
  },
};
