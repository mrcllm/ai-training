import type { AppError } from '../errors/app-error';

type RequestJsonOptions = {
  url: URL;
  signal: AbortSignal;
  fetcher: typeof fetch;
  unavailable: (message: string) => AppError;
  aborted: (message: string) => AppError;
  invalidPayload: (message: string) => AppError;
};

export type JsonResponse = {
  ok: boolean;
  status: number;
  payload: unknown;
};

export async function requestJson(options: RequestJsonOptions): Promise<JsonResponse> {
  let response: Response;
  try {
    response = await options.fetcher(options.url, { signal: options.signal });
  } catch {
    if (options.signal.aborted) throw options.aborted('Consulta à Open-Meteo cancelada');
    throw options.unavailable('Falha de rede ao consultar a Open-Meteo');
  }
  try {
    return { ok: response.ok, status: response.status, payload: await response.json() as unknown };
  } catch {
    throw options.invalidPayload('JSON inválido recebido da Open-Meteo');
  }
}
