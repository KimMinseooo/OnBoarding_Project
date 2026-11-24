import { z } from 'zod';
import { Color, Text } from './common';
import { FieldSchema } from './field';

// 화면 유형별 예시 화면 데이터 — docs/04_assignment-schema.md#mockup
const Fields = z.array(FieldSchema).min(1).max(10);

/* ---------- 초급 ---------- */
export const FormDataSchema = z.object({
  groupLabel: Text,
  fields: Fields,
  doneMessage: z.tuple([Text, Text]),
});
export const CalcDataSchema = z.object({
  fields: Fields,
  result: z.object({ label: Text, value: Text, unit: z.string().max(10) }),
  breakdown: z.array(z.tuple([Text, Text])).min(1).max(8),
  note: Text,
});
export const TodoDataSchema = z
  .object({
    placeholder: Text,
    items: z.array(z.object({ text: Text, done: z.boolean(), tag: Text })).min(3).max(10),
    tagColors: z.record(z.string(), Color),
  })
  .superRefine((d, ctx) => {
    for (const it of d.items)
      if (!d.tagColors[it.tag]) ctx.addIssue({ code: 'custom', message: `tagColors에 "${it.tag}" 색이 없습니다` });
  });
export const SettingsDataSchema = z
  .object({ tabs: z.array(Text).min(2).max(5), panels: z.array(Fields) })
  .refine((d) => d.tabs.length === d.panels.length, 'tabs와 panels 개수가 같아야 합니다');
export const WizardDataSchema = z
  .object({ steps: z.array(Text).min(3).max(6), pages: z.array(Fields) })
  .refine((d) => d.steps.length === d.pages.length, 'steps와 pages 개수가 같아야 합니다');
export const LookupDataSchema = z.object({
  people: z
    .array(z.object({ name: Text, position: Text, dept: Text, ext: Text, mail: Text, location: Text }))
    .min(3)
    .max(10),
});

/* ---------- 중급 공통 표 데이터 ---------- */
const Column = z.object({ header: Text, width: z.number().positive(), align: z.literal('right').optional() });
export const TableDataSchema = z.object({
  columns: z.array(Column).min(3).max(8),
  rows: z.array(z.array(z.string())).min(5).max(7),
  statusColumn: z.number().int().min(0),
  statusColors: z.record(z.string(), Color),
  form: z
    .array(
      z.object({
        label: Text,
        column: z.number().int().min(0),
        type: z.enum(['ro', 'text', 'combo', 'date']),
        required: z.boolean().optional(),
      }),
    )
    .min(3)
    .max(8),
  total: z.number().int().positive(),
  search: z
    .object({ combo: Text, text: Text, range: Text, rangeValue: z.tuple([Text, Text]) })
    .optional(),
});
type TableData = z.infer<typeof TableDataSchema>;

/** 표 데이터 내부 일관성: 행 길이, 열 번호, 상태 색 */
export function checkTable(d: TableData, ctx: z.RefinementCtx) {
  const n = d.columns.length;
  const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
  d.rows.forEach((r, i) => r.length !== n && issue(`rows[${i}] 길이(${r.length})가 columns(${n})와 다릅니다`));
  if (d.statusColumn >= n) issue('statusColumn이 열 범위를 벗어났습니다');
  for (const r of d.rows) {
    const v = r[d.statusColumn];
    if (v !== undefined && !d.statusColors[v]) issue(`statusColors에 "${v}" 색이 없습니다`);
  }
  d.form.forEach((f) => f.column >= n && issue(`form "${f.label}"의 column이 열 범위를 벗어났습니다`));
}
const colIn = (d: TableData, ...cols: number[]) => cols.every((c) => c < d.columns.length);

/* ---------- 중급 ---------- */
export const GridFormDataSchema = TableDataSchema.extend({
  search: TableDataSchema.shape.search.unwrap(),
}).superRefine(checkTable);

export const MasterDetailDataSchema = TableDataSchema.extend({
  nameColumn: z.number().int().min(0),
  subColumn: z.number().int().min(0),
  tabs: z.array(Text).min(2).max(4),
  history: z.object({
    title: Text,
    columns: z.array(Column).min(2).max(5),
    rows: z.array(z.array(z.string())).min(1).max(5),
  }),
}).superRefine((d, ctx) => {
  checkTable(d, ctx);
  if (!colIn(d, d.nameColumn, d.subColumn)) ctx.addIssue({ code: 'custom', message: 'nameColumn/subColumn 범위 오류' });
  d.history.rows.forEach(
    (r, i) =>
      r.length !== d.history.columns.length &&
      ctx.addIssue({ code: 'custom', message: `history.rows[${i}] 길이가 columns와 다릅니다` }),
  );
});

export const KanbanDataSchema = TableDataSchema.extend({
  lanes: z.array(Text).min(3).max(4),
  titleColumn: z.number().int().min(0),
  typeColumn: z.number().int().min(0),
  ownerColumn: z.number().int().min(0),
  moveLabel: Text,
}).superRefine((d, ctx) => {
  checkTable(d, ctx);
  if (!colIn(d, d.titleColumn, d.typeColumn, d.ownerColumn))
    ctx.addIssue({ code: 'custom', message: 'title/type/ownerColumn 범위 오류' });
  for (const r of d.rows)
    if (!d.lanes.includes(r[d.statusColumn]!))
      ctx.addIssue({ code: 'custom', message: `상태 "${r[d.statusColumn]}"가 lanes에 없습니다` });
});

export const CalendarDataSchema = TableDataSchema.extend({
  days: z.array(z.number().int().min(0).max(4)),
  times: z.array(z.tuple([z.number().min(9).max(18), z.number().min(9).max(18)])),
}).superRefine((d, ctx) => {
  checkTable(d, ctx);
  if (d.days.length !== d.rows.length || d.times.length !== d.rows.length)
    ctx.addIssue({ code: 'custom', message: 'days·times 개수는 rows와 같아야 합니다' });
  d.times.forEach(
    ([s, e], i) =>
      (s >= e || (s * 2) % 1 || (e * 2) % 1) &&
      ctx.addIssue({ code: 'custom', message: `times[${i}]는 시작<끝, 30분 단위여야 합니다` }),
  );
});

export const DashboardDataSchema = TableDataSchema.extend({
  kpis: z.array(z.object({ label: Text, value: Text, delta: Text, good: z.boolean() })).length(4),
  chart: z.object({ labels: z.array(Text).min(3).max(7), a: z.array(z.number()), b: z.array(z.number()) }),
  ratio: z.array(z.tuple([Text, z.number().min(0).max(100), Color])).min(2).max(5),
}).superRefine((d, ctx) => {
  checkTable(d, ctx);
  if (d.chart.a.length !== d.chart.labels.length || d.chart.b.length !== d.chart.labels.length)
    ctx.addIssue({ code: 'custom', message: 'chart a·b 길이는 labels와 같아야 합니다' });
  const sum = d.ratio.reduce((t, [, p]) => t + p, 0);
  if (sum !== 100) ctx.addIssue({ code: 'custom', message: `ratio 합계가 100이 아닙니다 (${sum})` });
});

export const TreeGridDataSchema = TableDataSchema.extend({
  tree: z
    .array(z.object({ text: Text, level: z.number().int().min(0).max(3), expanded: z.boolean().optional(), count: z.number().int().min(0) }))
    .min(2)
    .max(14),
  treeSelected: z.number().int().min(0),
  contextMenu: z.array(z.string()).min(2).max(8),
}).superRefine((d, ctx) => {
  checkTable(d, ctx);
  if (d.treeSelected >= d.tree.length) ctx.addIssue({ code: 'custom', message: 'treeSelected 범위 오류' });
});

export const MOCKUP_DATA_SCHEMAS = {
  form: FormDataSchema,
  calc: CalcDataSchema,
  todo: TodoDataSchema,
  settings: SettingsDataSchema,
  wizard: WizardDataSchema,
  lookup: LookupDataSchema,
  gridForm: GridFormDataSchema,
  masterDetail: MasterDetailDataSchema,
  kanban: KanbanDataSchema,
  calendar: CalendarDataSchema,
  dashboard: DashboardDataSchema,
  treeGrid: TreeGridDataSchema,
} as const;

export type MockupDataMap = { [K in keyof typeof MOCKUP_DATA_SCHEMAS]: z.infer<(typeof MOCKUP_DATA_SCHEMAS)[K]> };
export type TableDataOf<K extends keyof MockupDataMap> = MockupDataMap[K];
