import { Router } from 'express';
import { API_PATHS, type HealthResponse } from '@obp/shared';
import type { AppConfig } from '../config';

export function healthRouter(config: AppConfig) {
  const router = Router();
  router.get(API_PATHS.health, (_req, res) => {
    const body: HealthResponse = { ok: true, mock: config.useMock, version: config.version };
    res.json(body);
  });
  return router;
}
