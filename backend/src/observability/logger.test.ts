import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger';

afterEach(() => vi.restoreAllMocks());

describe('logger', () => {
  it.each([
    ['info', 'log'],
    ['warn', 'log'],
    ['error', 'error'],
  ] as const)('writes %s as structured JSON through console.%s', (level, method) => {
    const output = vi.spyOn(console, method).mockImplementation(() => undefined);
    logger[level]('server_event', { requestId: 'r-1', status: 200 });
    const entry = JSON.parse(String(output.mock.calls[0][0])) as Record<string, unknown>;
    expect(entry).toMatchObject({ level, event: 'server_event', requestId: 'r-1', status: 200 });
    expect(typeof entry.timestamp).toBe('string');
  });

  it('removes sensitive context fields from every log entry', () => {
    const output = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    logger.info('weather_event', {
      requestId: 'r-2', city: 'Lisboa', locationId: 123, coordinates: '1,2', payload: 'raw',
    });
    const entry = String(output.mock.calls[0][0]);
    expect(entry).toContain('requestId');
    expect(entry).not.toContain('Lisboa');
    expect(entry).not.toContain('123');
    expect(entry).not.toContain('coordinates');
    expect(entry).not.toContain('raw');
  });
});
