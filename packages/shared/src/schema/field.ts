import { z } from 'zod';
import { Text } from './common';

// 입력 항목 — docs/04_assignment-schema.md#공통-입력-항목-field
export const FIELD_TYPES = ['text', 'ro', 'multi', 'combo', 'date', 'num', 'radio', 'check', 'slider'] as const;

export const FieldSchema = z
  .object({
    label: Text,
    type: z.enum(FIELD_TYPES),
    value: z.union([z.string(), z.array(z.string())]).optional(),
    options: z.array(Text).min(1).max(6).optional(),
    selected: z.union([z.number().int().min(0), z.array(z.number().int().min(0))]).optional(),
    unit: z.string().max(10).optional(),
    percent: z.number().min(0).max(1).optional(),
    placeholder: z.string().max(60).optional(),
    required: z.boolean().optional(),
  })
  .superRefine((f, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
    if (f.type === 'radio') {
      if (!f.options || typeof f.selected !== 'number') issue('radio에는 options와 selected(숫자)가 필요합니다');
      else if (f.selected >= f.options.length) issue('radio selected가 options 범위를 벗어났습니다');
    }
    if (f.type === 'check') {
      if (!f.options || !Array.isArray(f.selected)) issue('check에는 options와 selected(배열)가 필요합니다');
      else if (f.selected.some((i) => i >= f.options!.length)) issue('check selected가 options 범위를 벗어났습니다');
    }
    if (f.type === 'slider' && f.percent === undefined) issue('slider에는 percent가 필요합니다');
    if (f.type === 'multi' && !Array.isArray(f.value)) issue('multi의 value는 줄 배열이어야 합니다');
  });

export type Field = z.infer<typeof FieldSchema>;
