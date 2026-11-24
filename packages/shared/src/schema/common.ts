import { z } from 'zod';

// 식별자 목록 — 값의 설명은 docs/06(프레임워크)·07(화면 유형)
export const FRAMEWORK_IDS = ['wpf', 'winform', 'react', 'python', 'node'] as const;
export const LEVELS = ['basic', 'intermediate'] as const;
export const BASIC_LAYOUTS = ['form', 'calc', 'todo', 'settings', 'wizard', 'lookup'] as const;
export const INTERMEDIATE_LAYOUTS = [
  'gridForm',
  'masterDetail',
  'kanban',
  'calendar',
  'dashboard',
  'treeGrid',
] as const;
export const LAYOUT_IDS = [...BASIC_LAYOUTS, ...INTERMEDIATE_LAYOUTS] as const;
export const CRUD_KEYS = ['R', 'C', 'U', 'D'] as const;

export const FrameworkIdSchema = z.enum(FRAMEWORK_IDS);
export const LevelSchema = z.enum(LEVELS);
export const LayoutIdSchema = z.enum(LAYOUT_IDS);

export type FrameworkId = z.infer<typeof FrameworkIdSchema>;
export type Level = z.infer<typeof LevelSchema>;
export type LayoutId = z.infer<typeof LayoutIdSchema>;
export type BasicLayoutId = (typeof BASIC_LAYOUTS)[number];
export type IntermediateLayoutId = (typeof INTERMEDIATE_LAYOUTS)[number];
export type CrudKey = (typeof CRUD_KEYS)[number];

export const levelOfLayout = (layout: LayoutId): Level =>
  (BASIC_LAYOUTS as readonly string[]).includes(layout) ? 'basic' : 'intermediate';

/** 짧은 한 줄 문장 */
export const Text = z.string().trim().min(1).max(200);
/** #rrggbb 색 */
export const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
