import { describe, expect, it } from 'vitest';
import { AssignmentDraftSchema, composeAssignment } from '@obp/shared';
import { readFileSync } from 'node:fs';
import { initialState, reducer, type Entry, type State } from './state';
import { MAX_ENTRIES, STORAGE_KEY, loadSaved, saveState, trimHistory } from './storage';

const draft = AssignmentDraftSchema.parse(JSON.parse(readFileSync(new URL('../../../../fixtures/basic-todo-todo.json', import.meta.url), 'utf8')));
const entry = (i: number, status: Entry['status'] = 'rejected'): Entry => ({ assignment: composeAssignment(draft, 'wpf', `a-${i}`), status });
const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
};
const stateWith = (history: Entry[], current = history.length - 1): State => ({ ...initialState, history, current, framework: 'react', level: 'intermediate' });

describe('기록 저장', () => {
  it('저장한 기록을 그대로 불러온다', () => {
    const store = memory();
    saveState(stateWith([entry(1), entry(2, 'adopted'), entry(3, 'proposed')], 1), store);
    const loaded = loadSaved(store)!;
    expect(loaded.history.map((e) => e.status)).toEqual(['rejected', 'adopted', 'proposed']);
    expect(loaded.current).toBe(1);
    expect(loaded.framework).toBe('react');
  });

  it('형식이 틀린 항목은 버리고, 깨진 데이터는 무시한다', () => {
    const store = memory();
    store.setItem(STORAGE_KEY, JSON.stringify({ framework: 'wpf', level: 'basic', current: 1, history: [{ assignment: { id: 'x' }, status: 'adopted' }, entry(2)] }));
    const loaded = loadSaved(store)!;
    expect(loaded.history).toHaveLength(1);
    expect(loaded.current).toBe(0);
    store.setItem(STORAGE_KEY, '{깨진');
    expect(loadSaved(store)).toBeNull();
    expect(loadSaved(null)).toBeNull();
  });

  it('기록을 비우면 저장소에서도 지운다', () => {
    const store = memory();
    saveState(stateWith([entry(1)]), store);
    saveState(reducer(stateWith([entry(1)]), { type: 'clear' }), store);
    expect(store.m.has(STORAGE_KEY)).toBe(false);
  });

  it(`${MAX_ENTRIES}개를 넘으면 오래된 넘김 기록부터 지우고 채택·현재 항목은 남긴다`, () => {
    const history = Array.from({ length: MAX_ENTRIES + 10 }, (_, i) => entry(i, i === 2 ? 'adopted' : 'rejected'));
    const { history: h, current } = trimHistory(history, 5);
    expect(h).toHaveLength(MAX_ENTRIES);
    expect(h.some((e) => e.assignment.id === 'a-2')).toBe(true);
    expect(h[current]!.assignment.id).toBe('a-5');
  });

  it('저장 실패는 화면 동작을 막지 않는다', () => {
    const bad = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); }, removeItem: () => {} };
    expect(() => saveState(stateWith([entry(1)]), bad)).not.toThrow();
  });
});
