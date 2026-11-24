import express, { type ErrorRequestHandler } from 'express';
import type { ApiError } from '@obp/shared';
import type { AppConfig } from './config';
import { healthRouter } from './routes/health';

/** Express 앱을 만듭니다. 테스트에서 포트를 열지 않고 쓸 수 있도록 listen과 분리했습니다. */
export function createApp(config: AppConfig) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.use(healthRouter(config));

  // 정의되지 않은 /api 경로는 공통 오류 형식으로 404 — docs/03_architecture.md#서버-api
  app.use('/api', (_req, res) => {
    const body: ApiError = { code: 'NOT_FOUND', message: '요청한 API가 없습니다.' };
    res.status(404).json(body);
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    const body: ApiError = { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' };
    res.status(500).json(body);
  };
  app.use(onError);

  return app;
}
