import type { Assignment, FrameworkId, GenerateRequest, Level } from '@obp/shared';

// 화면 상태와 제안 상태 흐름 — docs/02_ui-spec.md#제안-상태-흐름

export type ProposalStatus = 'proposed' | 'rejected' | 'adopted';
export type Entry = { assignment: Assignment; status: ProposalStatus };
export type RequestMode = 'new' | 'next';

export type State = {
  /** 컨트롤 바에서 고른 값 */
  framework: FrameworkId;
  level: Level;
  history: Entry[];
  /** 보고 있는 제안의 위치 (-1: 없음) */
  current: number;
  /** 진행 중인 요청 */
  pending: { mode: RequestMode; framework: FrameworkId; level: Level } | null;
  error: string | null;
  notice: string | null;
};

export type Action =
  | { type: 'select'; framework?: FrameworkId; level?: Level }
  | { type: 'request'; mode: RequestMode; framework: FrameworkId; level: Level }
  | { type: 'success'; assignment: Assignment; notice?: string }
  | { type: 'failure'; message: string }
  | { type: 'dismissError' }
  | { type: 'setStatus'; index: number; status: ProposalStatus }
  | { type: 'open'; index: number }
  | { type: 'clear' };

export const initialState: State = {
  framework: 'wpf',
  level: 'basic',
  history: [],
  current: -1,
  pending: null,
  error: null,
  notice: null,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'select':
      return { ...state, framework: action.framework ?? state.framework, level: action.level ?? state.level };
    case 'request':
      if (state.pending) return state;
      return { ...state, pending: { mode: action.mode, framework: action.framework, level: action.level }, error: null };
    case 'success': {
      if (!state.pending) return state;
      // 새 제안이 오면 보고 있던 "검토 중" 제안은 "넘김"으로
      const history = state.history.map((e, i) =>
        i === state.current && e.status === 'proposed' ? { ...e, status: 'rejected' as const } : e,
      );
      history.push({ assignment: action.assignment, status: 'proposed' });
      return {
        ...state,
        history,
        current: history.length - 1,
        framework: state.pending.framework,
        level: state.pending.level,
        pending: null,
        notice: action.notice ?? null,
      };
    }
    case 'failure':
      return { ...state, pending: null, error: action.message };
    case 'dismissError':
      return { ...state, error: null };
    case 'setStatus':
      if (!state.history[action.index]) return state;
      return {
        ...state,
        history: state.history.map((e, i) => (i === action.index ? { ...e, status: action.status } : e)),
      };
    case 'clear':
      return { ...state, history: [], current: -1, notice: null, error: null };
    case 'open': {
      const e = state.history[action.index];
      if (!e) return state;
      return { ...state, current: action.index, framework: e.assignment.framework, level: e.assignment.level, notice: null };
    }
  }
}

/** 같은 프레임워크·난이도의 최근 제안 (최신이 앞) — 서버의 중복·연속 방지에 씀 */
export function recentFor(state: State, framework: FrameworkId, level: Level): GenerateRequest['recent'] {
  return state.history
    .filter((e) => e.assignment.framework === framework && e.assignment.level === level)
    .reverse()
    .slice(0, 20)
    .map((e) => ({ title: e.assignment.title, layout: e.assignment.layout }));
}

export const currentEntry = (s: State): Entry | undefined => s.history[s.current];
/** 컨트롤 바의 선택이 보고 있는 과제와 다른가 */
export const isDirty = (s: State) => {
  const e = currentEntry(s);
  return !!e && (e.assignment.framework !== s.framework || e.assignment.level !== s.level);
};
export const adoptedCount = (s: State) => s.history.filter((e) => e.status === 'adopted').length;
