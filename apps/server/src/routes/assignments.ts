import { Router } from 'express';
import { API_PATHS, GenerateRequestSchema, type ApiError } from '@obp/shared';
import { GenerationError } from '../services/errors';
import type { Generator } from '../services/generator';

/** POST /api/assignments — docs/03_architecture.md#서버-api */
export function assignmentsRouter(generate: Generator | null) {
  const router = Router();
  router.post(API_PATHS.assignments, async (req, res) => {
    const parsed = GenerateRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = { code: 'BAD_REQUEST', message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ') };
      res.status(400).json(body);
      return;
    }
    if (!generate) {
      const body: ApiError = { code: 'NOT_IMPLEMENTED', message: '과제 생성기가 설정되지 않았습니다.' };
      res.status(501).json(body);
      return;
    }
    try {
      res.json(await generate(parsed.data));
    } catch (e) {
      if (!(e instanceof GenerationError)) throw e;
      console.warn(`[생성 실패] ${e.code}: ${e.message}`);
      const body: ApiError = { code: e.code, message: e.message };
      res.status(e.status).json(body);
    }
  });
  return router;
}
