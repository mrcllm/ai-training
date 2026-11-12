import { logger } from '../observability/logger';
import type { AppErrorLogLevel } from '../types/app-error-log-level';

type ProviderStep = {
  status: 'success' | 'failed';
  stage: 'location_search' | 'location_lookup' | 'forecast';
  startedAt: number;
  now: () => number;
  outcome?: string;
  level?: AppErrorLogLevel;
  requestId?: string;
};

export function logProviderStep(step: ProviderStep): void {
  const event = step.status === 'success' ? 'open_meteo_request_completed' : 'open_meteo_request_failed';
  const context = {
    stage: step.stage,
    durationMs: Math.max(0, step.now() - step.startedAt),
    outcome: step.outcome ?? step.status,
    requestId: step.requestId,
  };
  if (step.status === 'success') logger.info(event, context);
  else logger[step.level ?? 'warn'](event, context);
}
