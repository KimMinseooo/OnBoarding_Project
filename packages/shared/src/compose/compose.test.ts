import { describe, expect, it } from 'vitest';
import { FRAMEWORK_IDS, type FrameworkId } from '../schema/common';
import { AssignmentDraftSchema, type AssignmentDraft } from '../schema/draft';
import { AssignmentSchema } from '../schema/assignment';
import { composeAssignment } from './compose';
import { loadFixtures } from '../testing/fixtures';

const drafts = loadFixtures().map((f) => AssignmentDraftSchema.parse(f.json));
const draft = (id: string) => drafts.find((d) => d.id === id)! as AssignmentDraft;
const combos = drafts.flatMap((d) => FRAMEWORK_IDS.map((fw) => [d.id!, fw] as [string, FrameworkId]));
const sum = (a: ReturnType<typeof composeAssignment>, bonus = false) =>
  a.rubric.filter((g) => !!g.bonus === bonus).reduce((t, g) => t + g.items.reduce((u, i) => u + i.points, 0), 0);

describe('fixture × 프레임워크 80개 조합', () => {
  it('80개다', () => expect(combos).toHaveLength(80));

  it.each(combos)('%s × %s → 완성본 검증 통과, 채점표 필수 100점', (id, fw) => {
    const a = composeAssignment(draft(id), fw);
    expect(AssignmentSchema.safeParse(a).success).toBe(true);
    expect(sum(a)).toBe(100);
    expect(a.framework).toBe(fw);
    expect(a.estimatedDays.min).toBeGreaterThan(0);
    expect(JSON.stringify(a)).not.toMatch(/\{(Entity|entity|Logic|logic|slug|entity_snake|logic_snake)\}/);
  });
});

describe('규칙 반영 (docs/05·06)', () => {
  it('WPF 초급은 MVVM 3단 구조와 코드 비하인드 규칙, +1일', () => {
    const a = composeAssignment(draft('basic-calc-trip-calc'), 'wpf');
    expect(a.architecture.layers.map((l) => l.name)).toEqual(['View', 'ViewModel', 'Logic']);
    expect(a.architecture.rules[0]).toContain('InitializeComponent');
    expect(a.estimatedDays).toEqual({ min: 2, max: 2 });
    expect(a.rubric.find((g) => g.group === '코드 구조')!.items[0]!.text).toContain('코드 비하인드');
  });

  it('초급은 2계층·힌트 있음·데이터 가이드 없음', () => {
    const a = composeAssignment(draft('basic-todo-todo'), 'react');
    expect(a.architecture.layers).toHaveLength(2);
    expect(a.hints?.length).toBeGreaterThan(0);
    expect(a.dataGuide).toBeUndefined();
    expect(a.mockup.url).toBe('localhost:5173/todo');
  });

  it('중급은 3-tier, 업무 규칙이 구조 규칙·채점표에 들어감, Python은 -1일', () => {
    const d = draft('intermediate-dashboard-stock-moves');
    const a = composeAssignment(d, 'python');
    expect(a.architecture.layers.map((l) => l.name)).toEqual(['Presentation', 'Business', 'Data']);
    expect(a.architecture.layers[0]!.files[0]).toBe('ui/stock_move_view.py');
    expect(a.architecture.rules.join()).toContain(d.businessRule!);
    expect(a.rubric.find((g) => g.group === '3-tier 구조')!.items[1]!.text).toContain(d.businessRule!);
    expect(a.estimatedDays).toEqual({ min: 3, max: 4 });
    expect(a.hints).toBeUndefined();
  });

  it('중급 요구사항 뒤에 프레임워크 구현 포인트가 붙고, NodeJS는 API 경로에 slug가 들어감', () => {
    const a = composeAssignment(draft('intermediate-kanban-inquiries'), 'node');
    const d = a.requirements.find((r) => r.key === 'D')!;
    expect(d.items.at(-2)).toBe('DELETE /api/inquiries/:id — 성공 시 204');
    expect(a.dataGuide!.questions.at(-1)).toContain('API');
  });

  it('가산점은 필수 점수와 따로, 최대 4개', () => {
    const a = composeAssignment(draft('intermediate-calendar-reservations'), 'react');
    const bonus = a.rubric.find((g) => g.bonus)!;
    expect(bonus.items.length).toBeLessThanOrEqual(4);
    expect(sum(a, true)).toBe(bonus.items.length * 5);
  });
});
