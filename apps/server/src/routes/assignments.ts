import { Router } from 'express';
import { API_PATHS, GenerateRequestSchema, type ApiError } from '@obp/shared';
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
      const body: ApiError = { code: 'NOT_IMPLEMENTED', message: 'Claude API 연동은 5단계에서 구현합니다. 지금은 USE_MOCK=true로 실행하세요.' };
      res.status(501).json(body);
      return;
    }
    res.json(await generate(parsed.data));
  });
  return router;
}
