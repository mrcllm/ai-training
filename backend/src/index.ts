import 'dotenv/config';
import type { Server } from 'node:http';
import { createApp } from './app';
import { loadEnvironment } from './config/environment';
import { logger } from './observability/logger';
import { createShutdownHandler } from './runtime/shutdown';

const environment = loadEnvironment();
const server: Server = createApp(environment).listen(environment.port, () => {
  logger.info('server_started', { port: environment.port });
});
const shutdown = createShutdownHandler({
  server,
  timeoutMs: environment.shutdownTimeoutMs,
  setTimer: setTimeout,
  clearTimer: clearTimeout,
  setExitCode: (code: number) => { process.exitCode = code; },
});
process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
process.once('SIGINT', () => { void shutdown('SIGINT'); });
