import { vi } from 'vitest';

export type BackendReply = { ok: boolean; body: unknown };
type BackendHandler = (url: URL) => BackendReply | Promise<BackendReply>;

export function stubBackend(handler: BackendHandler): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async (input: URL) => {
    const reply = await handler(new URL(input));
    return { ok: reply.ok, json: async () => reply.body };
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function requestedUrls(fetchMock: ReturnType<typeof vi.fn>): string[] {
  return fetchMock.mock.calls.map((call) => String(call[0]));
}
