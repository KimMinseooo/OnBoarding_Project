import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type ErrorRequestHandler } from 'express';
import type { ApiError } from '@obp/shared';
import type { AppConfig } from './config';
import { loadDrafts } from './mock/fixtures';
import { assignmentsRouter } from './routes/assignments';
import { healthRouter } from './routes/health';
import { createClaudeClient } from './claude/client';
import { createClaudeGenerator } from './services/claudeGenerator';
import { createMockGenerator, type Generator } from './services/generator';

import type { AssignmentDraft } from '@obp/shared';

type Deps = { generate?: Generator | null; webDist?: string | null; /** 샘플 과제 (기본: 저장소 fixtures/) */ drafts?: AssignmentDraft[] };

/** 빌드된 웹 화면 위치 (npm run build 결과). 있으면 이 서버 하나로 화면과 API를 함께 제공 — docs/03_architecture.md#배포 */
export const DEFAULT_WEB_DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../web/dist');

/** Express 앱을 만듭니다. 테스트에서 포트를 열지 않고 쓸 수 있도록 listen과 분리했습니다. */
export function createApp(config: AppConfig, deps: Deps = {}) {
  const drafts = () => deps.drafts ?? loadDrafts();
  const generate =
    deps.generate !== undefined
      ? deps.generate
      : config.useMock
        ? createMockGenerator(drafts())
        : createClaudeGenerator({ call: createClaudeClient(config), examples: drafts() });

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.use(healthRouter(config));
  app.use(assignmentsRouter(generate));

  // 정의되지 않은 /api 경로는 공통 오류 형식으로 404 — docs/03_architecture.md#서버-api
  app.use('/api', (_req, res) => {
    const body: ApiError = { code: 'NOT_FOUND', message: '요청한 API가 없습니다.' };
    res.status(404).json(body);
  });

  // 배포 모드: 빌드된 웹 화면 제공. 화면 주소는 모두 index.html로 (개발 중에는 Vite가 담당)
  const webDist = deps.webDist !== undefined ? deps.webDist : DEFAULT_WEB_DIST;
  if (webDist && existsSync(path.join(webDist, 'index.html'))) {
    app.use(express.static(webDist, { index: 'index.html', maxAge: '1h' }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(webDist, 'index.html'));
    });
  }

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    const body: ApiError = { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' };
    res.status(500).json(body);
  };
  app.use(onError);

  return app;
}
