import { logger } from '../observability/logger';

export type ShutdownDependencies = {
  server: {
    close: (callback: (error?: Error) => void) => void;
    closeAllConnections: () => void;
  };
  timeoutMs: number;
  setTimer: typeof setTimeout;
  clearTimer: typeof clearTimeout;
  setExitCode: (code: number) => void;
};

export function createShutdownHandler(dependencies: ShutdownDependencies): (signal: string) => Promise<void> {
  let shutdownPromise: Promise<void> | undefined;
  return (signal: string): Promise<void> => {
    if (shutdownPromise !== undefined) return shutdownPromise;
    shutdownPromise = new Promise<void>((resolve) => {
      logger.info('server_shutdown', { signal });
      const timeout = dependencies.setTimer(() => {
        dependencies.server.closeAllConnections();
        dependencies.setExitCode(1);
        logger.error('server_shutdown_timeout', { signal });
        resolve();
      }, dependencies.timeoutMs);
      dependencies.server.close((error?: Error) => {
        dependencies.clearTimer(timeout);
        if (error !== undefined) {
          dependencies.setExitCode(1);
          logger.error('server_shutdown_failed', { signal, errorName: error.name });
        }
        resolve();
      });
    });
    return shutdownPromise;
  };
}
