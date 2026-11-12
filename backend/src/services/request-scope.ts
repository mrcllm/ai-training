export type RequestScope = {
  signal: AbortSignal;
  close: () => void;
};

export function createRequestScope(source: AbortSignal | undefined, timeoutMs: number): RequestScope {
  const controller = new AbortController();
  const abort = (): void => controller.abort(source?.reason);
  if (source?.aborted) abort();
  else source?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    close: () => {
      clearTimeout(timeout);
      source?.removeEventListener('abort', abort);
    },
  };
}
