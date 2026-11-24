import { z } from 'zod';

/** GET /api/health 응답 — docs/03_architecture.md#서버-api */
export const HealthResponseSchema = z.object({
  ok: z.boolean(),
  mock: z.boolean(),
  version: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/** 서버 오류 응답 공통 형식 { code, message } — docs/03_architecture.md#서버-api */
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
