import type { ApiErrorCode } from '../types/api-error';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';
const SOURCE_NAME = 'Open-Meteo';
const SOURCE_URL = 'https://open-meteo.com/';

export type ApiReply = {
  ok: boolean;
  payload: unknown;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isSourceAttribution(value: unknown): boolean {
  return isRecord(value) && value.name === SOURCE_NAME && value.url === SOURCE_URL;
}

export function readApiErrorCode<T extends ApiErrorCode>(payload: unknown, known: Record<T, unknown>): T | undefined {
  if (!isRecord(payload) || !isRecord(payload.error)) return undefined;
  const code = payload.error.code;
  return typeof code === 'string' && Object.prototype.hasOwnProperty.call(known, code) ? code as T : undefined;
}

export async function getJson(path: string, params: Record<string, string>, signal: AbortSignal): Promise<ApiReply> {
  const endpoint = new URL(path, API_BASE_URL);
  Object.entries(params).forEach(([key, value]) => endpoint.searchParams.set(key, value));
  const response = await fetch(endpoint, { signal });
  const payload: unknown = await response.json().catch(() => undefined);
  return { ok: response.ok, payload };
}
