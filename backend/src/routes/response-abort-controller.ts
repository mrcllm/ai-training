import type { Response } from 'express';

export function responseAbortController(response: Response): AbortController {
  const controller = new AbortController();
  response.once('close', () => {
    if (!response.writableEnded) controller.abort();
  });
  return controller;
}
