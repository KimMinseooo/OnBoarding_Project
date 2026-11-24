import { z } from 'zod';
import { CRUD_KEYS, LevelSchema, Text, levelOfLayout } from './common';
import { layoutVariants } from './variants';

// Claude 출력·fixtures 형식 — docs/04_assignment-schema.md#assignmentdraft-claude-출력--fixtures-형식

export const RequirementSchema = z.object({
  key: z.string().min(1).max(2),
  name: Text,
  items: z.array(Text).min(1).max(8),
});
export type Requirement = z.infer<typeof RequirementSchema>;

const PASCAL = /^[A-Z][A-Za-z0-9]{1,40}$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const draftShape = {
  id: z.string().regex(/^[a-z0-9-]+$/).optional(),
  level: LevelSchema,
  title: Text.max(40),
  team: Text,
  problem: z.string().trim().min(10).max(400),
  learningGoal: Text.optional(),
  entity: z.object({ name: z.string().regex(PASCAL), slug: z.string().regex(KEBAB) }),
  logicClass: z.string().regex(PASCAL).optional(),
  businessRule: Text.optional(),
  requirements: z.array(RequirementSchema).length(4),
  optionalFeatures: z.array(Text).min(1).max(4),
  exceptions: z.array(Text).length(3),
  relationHint: Text.optional(),
};

export const AssignmentDraftSchema = z
  .discriminatedUnion('layout', layoutVariants(draftShape, { appTitle: Text, nav: z.array(Text).min(1).max(6).optional() }))
  .superRefine((d, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
    if (levelOfLayout(d.layout) !== d.level) issue(`화면 유형 ${d.layout}은(는) ${d.level} 난이도에 쓸 수 없습니다`);
    const keys = d.requirements.map((r) => r.key).join(',');
    if (d.level === 'basic') {
      if (!d.learningGoal) issue('초급은 learningGoal이 필요합니다');
      if (!d.logicClass) issue('초급은 logicClass가 필요합니다');
      if (keys !== '1,2,3,4') issue('초급 requirements key는 1,2,3,4 순서여야 합니다');
    } else {
      if (!d.businessRule) issue('중급은 businessRule이 필요합니다');
      if (!d.relationHint) issue('중급은 relationHint가 필요합니다');
      if (keys !== CRUD_KEYS.join(',')) issue('중급 requirements key는 R,C,U,D 순서여야 합니다');
    }
  });

export type AssignmentDraft = z.infer<typeof AssignmentDraftSchema>;
