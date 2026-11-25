import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { FrameworkId, Level } from '@obp/shared';
import { fetchHealth, generateAssignment } from '../api/client';
import { ControlBar } from '../features/generator/ControlBar';
import { DecisionBar } from '../features/generator/DecisionBar';
import { LoadingOverlay } from '../features/generator/LoadingOverlay';
import { SpecPanel } from '../features/spec/SpecPanel';
import { MockupViewer } from '../renderer/MockupViewer';
import { adoptedCount, currentEntry, initialState, isDirty, recentFor, reducer, type RequestMode, type State } from './state';
import { loadSaved, saveState } from './storage';

/** 저장된 기록이 있으면 이어서 보여 줍니다 — docs/03_architecture.md#저장 */
const restore = (s: State): State => ({ ...s, ...(loadSaved() ?? {}) });

/** 화면 전체 배치 — docs/02_ui-spec.md#전체-배치 */
export function App() {
  const [state, dispatch] = useReducer(reducer, initialState, restore);
  const [mock, setMock] = useState<boolean | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const generate = useCallback(async (mode: RequestMode, framework: FrameworkId, level: Level) => {
    const s = stateRef.current;
    if (s.pending) return;
    dispatch({ type: 'request', mode, framework, level });
    try {
      const res = await generateAssignment({ framework, level, recent: recentFor(s, framework, level) });
      dispatch({ type: 'success', assignment: res.assignment, notice: res.notice });
    } catch (e) {
      dispatch({ type: 'failure', message: e instanceof Error ? e.message : String(e) });
    }
  }, []);

  // 처음 열 때 저장된 기록이 없으면 기본 선택(WPF 초급)으로 첫 아이디어를 제안 (StrictMode의 두 번 실행 방지)
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (stateRef.current.history.length === 0) void generate('new', initialState.framework, initialState.level);
    fetchHealth()
      .then((h) => setMock(h.mock))
      .catch(() => setMock(null));
  }, [generate]);

  // 기록·선택이 바뀔 때마다 저장
  useEffect(() => saveState(state), [state.history, state.current, state.framework, state.level]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearHistory = () => {
    if (!window.confirm('제안 기록을 모두 지울까요? 채택한 과제도 함께 지워집니다.')) return;
    dispatch({ type: 'clear' });
    void generate('new', stateRef.current.framework, stateRef.current.level);
  };

  const entry = currentEntry(state);
  const adopted = adoptedCount(state);

  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" width={30} height={30} />
            <div>
              <h1 className="text-[16px] leading-tight font-extrabold">온보딩 과제 생성기</h1>
              <div className="text-[12px] text-gray-500">신입사원 실무 과제 · 명세서 + 예시 화면</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            {adopted > 0 && <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">채택한 과제 {adopted}개</span>}
            {mock && <span className="rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-gray-500">Mock 데이터 (샘플 과제)</span>}
          </div>
        </div>
      </header>

      <ControlBar
        framework={state.framework}
        level={state.level}
        loading={!!state.pending}
        dirty={isDirty(state)}
        onSelect={(v) => dispatch({ type: 'select', ...v })}
        onGenerate={() => void generate('new', state.framework, state.level)}
      />

      <main className="relative mx-auto min-h-[60vh] max-w-[1320px] px-4 py-5 sm:px-6">
        {state.pending && <LoadingOverlay {...state.pending} />}

        {state.error && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
            <span>
              <b>과제를 만들지 못했어요.</b> {state.error}
            </span>
            <button
              type="button"
              onClick={() => void generate('new', state.framework, state.level)}
              className="h-11 rounded-lg bg-white px-4 font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
            >
              다시 시도
            </button>
          </div>
        )}

        {entry && (
          <>
            <DecisionBar
              key={state.current}
              history={state.history}
              current={state.current}
              loading={!!state.pending}
              notice={state.notice}
              onNext={() => void generate('next', entry.assignment.framework, entry.assignment.level)}
              onStatus={(status) => dispatch({ type: 'setStatus', index: state.current, status })}
              onOpen={(index) => dispatch({ type: 'open', index })}
              onClear={clearHistory}
            />
            <div key={entry.assignment.id} className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="order-2 lg:order-1">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-gray-500">
                  <span className="h-px flex-1 bg-gray-200" />
                  상세 개발 명세서
                  <span className="h-px flex-1 bg-gray-200" />
                </div>
                <SpecPanel a={entry.assignment} />
              </div>
              <div className="order-1 lg:order-2">
                <div className="lg:sticky lg:top-[108px]">
                  <MockupViewer key={entry.assignment.id} a={entry.assignment} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
