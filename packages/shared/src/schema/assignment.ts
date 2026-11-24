import { z } from 'zod';
import { FrameworkIdSchema, LevelSchema, Text, levelOfLayout } from './common';
import { RequirementSchema } from './draft';
import { layoutVariants } from './variants';

// 완성본 형식 — docs/04_assignment-schema.md#assignment-완성본

export const ArchitectureSchema = z.object({
  title: Text,
  layers: z.array(z.object({ name: Text, role: Text, files: z.array(Text).min(1) })).min(2).max(4),
  common: z.array(Text).optional(),
  rules: z.array(Text).min(1),
  note: Text.optional(),
});

export const RubricGroupSchema = z.object({
  group: Text,
  bonus: z.boolean().optional(),
  items: z.array(z.object({ text: z.string().min(1).max(300), points: z.number().int().positive() })).min(1),
});

const assignmentShape = {
  id: z.string().min(1),
  framework: FrameworkIdSchema,
  level: LevelSchema,
  title: Text,
  team: Text,
  scenario: z.string().min(10).max(600),
  learningGoal: Text,
  estimatedDays: z.object({ min: z.number().int().positive(), max: z.number().int().positive() }),
  controls: z.array(Text).min(1),
  tech: z.array(Text).min(1),
  architecture: ArchitectureSchema,
  requirements: z.array(RequirementSchema).length(4),
  optionalFeatures: z.array(Text).min(1).max(8),
  hints: z.array(Text).optional(),
  exceptions: z.array(Text).min(3).max(6),
  dataGuide: z.object({ questions: z.array(Text).min(3), deliverable: Text }).optional(),
  rubric: z.array(RubricGroupSchema).min(1),
};
const mockupShape = {
  appTitle: Text,
  url: z.string().optional(),
  nav: z.array(Text).optional(),
  menu: z.array(Text).optional(),
};

export const AssignmentSchema = z
  .discriminatedUnion('layout', layoutVariants(assignmentShape, mockupShape))
  .superRefine((a, ctx) => {
    for (const message of assignmentIssues(a)) ctx.addIssue({ code: 'custom', message });
  });

export type Assignment = z.infer<typeof AssignmentSchema>;
export type RubricGroup = z.infer<typeof RubricGroupSchema>;

/** 스키마 외 추가 검사 — docs/04_assignment-schema.md#검증-규칙-스키마-외-추가-검사 */
export function assignmentIssues(a: Pick<Assignment, 'level' | 'layout' | 'rubric' | 'dataGuide' | 'hints' | 'estimatedDays'>): string[] {
  const out: string[] = [];
  if (levelOfLayout(a.layout) !== a.level) out.push(`화면 유형 ${a.layout}과 난이도 ${a.level}가 맞지 않습니다`);
  const base = a.rubric.filter((g) => !g.bonus).reduce((t, g) => t + g.items.reduce((u, i) => u + i.points, 0), 0);
  if (base !== 100) out.push(`채점표 필수 합계가 100이 아닙니다 (${base})`);
  if (a.level === 'intermediate') {
    if (!a.dataGuide) out.push('중급은 dataGuide가 필요합니다');
    if (a.hints?.length) out.push('중급에는 hints를 넣지 않습니다');
  } else {
    if (!a.hints?.length) out.push('초급은 hints가 필요합니다');
    if (a.dataGuide) out.push('초급에는 dataGuide를 넣지 않습니다');
  }
  if (a.estimatedDays.min > a.estimatedDays.max) out.push('estimatedDays.min이 max보다 큽니다');
  return out;
}
