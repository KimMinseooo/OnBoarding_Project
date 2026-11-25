import { describe, expect, it } from 'vitest';
import { AssignmentDraftSchema } from './draft';
import { loadFixtures } from '../testing/fixtures';

const fixtures = loadFixtures();
const clone = <T>(x: T): T => structuredClone(x);
const byId = (id: string) => clone(fixtures.find((f) => f.file === `${id}.json`)!.json) as Record<string, any>;

describe('fixtures (Draft 형식)', () => {
  it('36개가 있다 (화면 유형마다 3개, 서로 다른 제목)', () => {
    expect(fixtures).toHaveLength(36);
    const per = new Map<string, number>();
    for (const f of fixtures) { const d = f.json as { layout: string }; per.set(d.layout, (per.get(d.layout) ?? 0) + 1); }
    expect([...per.values()]).toEqual(Array(12).fill(3));
    expect(new Set(fixtures.map((f) => (f.json as { title: string }).title)).size).toBe(36);
  });

  it.each(fixtures.map((f) => [f.file, f.json]))('%s 가 Draft 검증을 통과하고 id가 파일 이름과 같다', (file, json) => {
    const d = AssignmentDraftSchema.parse(json);
    expect(`${d.id}.json`).toBe(file);
  });
});

describe('잘못된 Draft는 거부한다', () => {
  it('난이도와 맞지 않는 화면 유형', () => {
    const d = byId('basic-form-apply');
    d.layout = 'kanban';
    expect(AssignmentDraftSchema.safeParse(d).success).toBe(false);
  });

  it('중급에 businessRule이 없음', () => {
    const d = byId('intermediate-grid-form-assets');
    delete d.businessRule;
    expect(AssignmentDraftSchema.safeParse(d).success).toBe(false);
  });

  it('표의 상태 값이 statusColors·lanes에 없음', () => {
    const d = byId('intermediate-kanban-inquiries');
    d.mockup.data.rows[0][5] = '없는상태';
    const r = AssignmentDraftSchema.safeParse(d);
    expect(r.success).toBe(false);
  });

  it('행 길이가 열 개수와 다름', () => {
    const d = byId('intermediate-grid-form-assets');
    d.mockup.data.rows[0].pop();
    expect(AssignmentDraftSchema.safeParse(d).success).toBe(false);
  });

  it('예외 조건이 3개가 아님', () => {
    const d = byId('basic-calc-trip-calc');
    d.exceptions.push('네 번째 조건');
    expect(AssignmentDraftSchema.safeParse(d).success).toBe(false);
  });

  it('radio 선택 값이 범위를 벗어남', () => {
    const d = byId('basic-form-apply');
    const radio = d.mockup.data.fields.find((f: any) => f.type === 'radio');
    radio.selected = 9;
    expect(AssignmentDraftSchema.safeParse(d).success).toBe(false);
  });
});
