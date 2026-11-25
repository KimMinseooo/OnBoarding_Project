import { z } from 'zod';
import { FrameworkIdSchema, LayoutIdSchema, LevelSchema, Text } from './common';
import { AssignmentSchema } from './assignment';

// POST /api/assignments — docs/03_architecture.md#서버-api
export const GenerateRequestSchema = z.object({
  framework: FrameworkIdSchema,
  level: LevelSchema,
  /** 같은 프레임워크·난이도의 최근 제안, 최신이 앞 */
  recent: z.array(z.object({ title: Text, layout: LayoutIdSchema })).max(20).default([]),
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const GenerateResponseSchema = z.object({
  assignment: AssignmentSchema,
  notice: z.string().optional(),
});
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
