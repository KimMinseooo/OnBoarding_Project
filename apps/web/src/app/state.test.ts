import { describe, expect, it } from 'vitest';
import { AssignmentDraftSchema, composeAssignment, type Assignment } from '@obp/shared';
import { readFileSync } from 'node:fs';
import { initialState, isDirty, recentFor, reducer, type State } from './state';

const draft = (id: string) =>
  AssignmentDraftSchema.parse(JSON.parse(readFileSync(new URL(`../../../../fixtures/${id}.json`, import.meta.url), 'utf8')));
const A = composeAssignment(draft('basic-form-apply'), 'wpf', 'a');
const B = composeAssignment(draft('basic-calc-trip-calc'), 'wpf', 'b');
const C = composeAssignment(draft('intermediate-kanban-inquiries'), 'react', 'c');

const propose = (s: State, a: Assignment, mode: 'new' | 'next' = 'new') =>
  reducer(reducer(s, { type: 'request', mode, framework: a.framework, level: a.level }), { type: 'success', assignment: a });

describe('제안 상태 흐름 (docs/02)', () => {
  it('새 제안이 오면 이전 "검토 중"은 "넘김"이 된다', () => {
    const s = propose(propose(initialState, A), B, 'next');
    expect(s.history.map((e) => e.status)).toEqual(['rejected', 'proposed']);
    expect(s.current).toBe(1);
  });

  it('채택한 제안은 다음 제안이 와도 채택으로 남는다', () => {
    let s = propose(initialState, A);
    s = reducer(s, { type: 'setStatus', index: 0, status: 'adopted' });
    s = propose(s, B, 'next');
    expect(s.history.map((e) => e.status)).toEqual(['adopted', 'proposed']);
  });

  it('요청 중에는 다른 요청을 받지 않는다', () => {
    const s = reducer(initialState, { type: 'request', mode: 'new', framework: 'wpf', level: 'basic' });
    expect(reducer(s, { type: 'request', mode: 'new', framework: 'react', level: 'basic' })).toBe(s);
  });

  it('실패하면 요청이 끝나고 오류가 남는다', () => {
    let s = reducer(initialState, { type: 'request', mode: 'new', framework: 'wpf', level: 'basic' });
    s = reducer(s, { type: 'failure', message: '네트워크 오류' });
    expect(s.pending).toBeNull();
    expect(s.error).toBe('네트워크 오류');
  });

  it('기록을 열면 컨트롤 바 선택도 그 과제 값으로 바뀐다', () => {
    let s = propose(propose(initialState, A), C);
    s = reducer(s, { type: 'open', index: 0 });
    expect([s.current, s.framework, s.level]).toEqual([0, 'wpf', 'basic']);
    expect(isDirty(s)).toBe(false);
    expect(isDirty(reducer(s, { type: 'select', level: 'intermediate' }))).toBe(true);
  });

  it('recent는 같은 프레임워크·난이도만, 최신이 앞', () => {
    const s = propose(propose(propose(initialState, A), C), B);
    expect(recentFor(s, 'wpf', 'basic').map((r) => r.title)).toEqual([B.title, A.title]);
  });
});
