import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../observability/logger';
import { createShutdownHandler } from './shutdown';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('createShutdownHandler', () => {
  it('closes once when repeated signals arrive and clears its deadline', async () => {
    vi.useFakeTimers();
    vi.spyOn(logger, 'info').mockImplementation(() => undefined);
    const close = vi.fn((callback: (error?: Error) => void) => { callback(); });
    const clearTimer = vi.fn<typeof clearTimeout>();
    const shutdown = createShutdownHandler({
      server: { close, closeAllConnections: vi.fn() },
      timeoutMs: 1000,
      setTimer: setTimeout,
      clearTimer,
      setExitCode: vi.fn(),
    });
    const first = shutdown('SIGTERM');
    const second = shutdown('SIGINT');
    await Promise.all([first, second]);
    expect(close).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect(clearTimer).toHaveBeenCalledTimes(1);
  });

  it('forces connections closed and sets failure status when the deadline expires', async () => {
    vi.useFakeTimers();
    vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const closeAllConnections = vi.fn();
    const setExitCode = vi.fn();
    const shutdown = createShutdownHandler({
      server: { close: vi.fn(), closeAllConnections },
      timeoutMs: 250,
      setTimer: setTimeout,
      clearTimer: clearTimeout,
      setExitCode,
    });
    const result = shutdown('SIGTERM');
    await vi.advanceTimersByTimeAsync(250);
    await result;
    expect(closeAllConnections).toHaveBeenCalledOnce();
    expect(setExitCode).toHaveBeenCalledWith(1);
  });

  it('records an error closing the server and sets failure status', async () => {
    vi.useFakeTimers();
    vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const setExitCode = vi.fn();
    const shutdown = createShutdownHandler({
      server: { close: (callback) => { callback(new Error('close failed')); }, closeAllConnections: vi.fn() },
      timeoutMs: 250,
      setTimer: setTimeout,
      clearTimer: clearTimeout,
      setExitCode,
    });
    await shutdown('SIGINT');
    expect(setExitCode).toHaveBeenCalledWith(1);
  });
});
