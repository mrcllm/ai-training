import { Router } from 'express';

export const healthRoute = Router();

healthRoute.get('/health', (_request, response) => {
  response.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
