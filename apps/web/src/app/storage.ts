import { z } from 'zod';
import { AssignmentSchema, FrameworkIdSchema, LevelSchema } from '@obp/shared';
import type { Entry, State } from './state';

// 제안 기록 브라우저 저장 — docs/03_architecture.md#저장
// 형식이 바뀌면 키 버전을 올리고 이전 데이터는 버립니다.

export const STORAGE_KEY = 'onboarding.history.v1';
/** 기록 최대 개수 — 채택한 과제는 항상 남기고, 나머지는 최근 것부터 */
export const MAX_ENTRIES = 60;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const SavedSchema = z.object({
  framework: FrameworkIdSchema,
  level: LevelSchema,
  current: z.number().int(),
  history: z.array(z.unknown()),
});
const EntrySchema = z.object({ assignment: AssignmentSchema, status: z.enum(['proposed', 'rejected', 'adopted']) });

/** 사생활 보호 모드 등에서 localStorage 접근 자체가 실패할 수 있어 감쌉니다 */
export function browserStore(): Store | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** 저장된 기록을 읽습니다. 형식이 틀린 항목은 버리고, 읽을 수 없으면 null */
export function loadSaved(store: Store | null = browserStore()): Pick<State, 'framework' | 'level' | 'history' | 'current'> | null {
  try {
    const raw = store?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = SavedSchema.safeParse(JSON.parse(raw));
    if (!saved.success) return null;
    const history: Entry[] = [];
    let current = -1;
    saved.data.history.forEach((e, i) => {
      const r = EntrySchema.safeParse(e);
      if (!r.success) return;
      if (i === saved.data.current) current = history.length;
      history.push(r.data);
    });
    if (history.length === 0) return null;
    return { framework: saved.data.framework, level: saved.data.level, history, current: current >= 0 ? current : history.length - 1 };
  } catch {
    return null;
  }
}

/** 오래된 "검토 중·넘김" 기록부터 잘라 MAX_ENTRIES 이하로 */
export function trimHistory(history: Entry[], current: number): { history: Entry[]; current: number } {
  if (history.length <= MAX_ENTRIES) return { history, current };
  let drop = history.length - MAX_ENTRIES;
  const keep = history.map((e, i) => {
    if (drop > 0 && e.status !== 'adopted' && i !== current) {
      drop--;
      return false;
    }
    return true;
  });
  const next = history.filter((_, i) => keep[i]);
  return { history: next, current: keep.slice(0, current + 1).filter(Boolean).length - 1 };
}

export function saveState(s: State, store: Store | null = browserStore()): void {
  try {
    if (!store) return;
    if (s.history.length === 0) {
      store.removeItem(STORAGE_KEY);
      return;
    }
    const { history, current } = trimHistory(s.history, s.current);
    store.setItem(STORAGE_KEY, JSON.stringify({ framework: s.framework, level: s.level, current, history }));
  } catch {
    /* 저장 공간 부족 등 — 저장은 편의 기능이라 화면 동작은 계속 */
  }
}
