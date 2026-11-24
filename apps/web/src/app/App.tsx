import { useCallback, useEffect, useState } from 'react';
import type { HealthResponse } from '@obp/shared';
import { fetchHealth } from '../api/client';

type Status =
  | { state: 'loading' }
  | { state: 'ok'; data: HealthResponse }
  | { state: 'error'; message: string };

/**
 * 1단계 골격 화면: 서버 연결 상태만 보여 줍니다.
 * 3단계에서 docs/02_ui-spec.md의 화면 셸로 교체합니다.
 */
export function App() {
  const [status, setStatus] = useState<Status>({ state: 'loading' });

  const check = useCallback(() => {
    setStatus({ state: 'loading' });
    fetchHealth()
      .then((data) => setStatus({ state: 'ok', data }))
      .catch((e: unknown) =>
        setStatus({ state: 'error', message: e instanceof Error ? e.message : String(e) }),
      );
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-[1320px] items-center gap-2.5 px-6 py-3">
          <img src="/favicon.svg" alt="" width={30} height={30} />
          <div>
            <div className="text-[16px] font-extrabold leading-tight">온보딩 과제 생성기</div>
            <div className="text-[12px] text-gray-500">개발 1단계 · 프로젝트 골격</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-6 py-8">
        <section className="max-w-md rounded-2xl border border-gray-200 p-5">
          <h1 className="text-[17px] font-bold">서버 연결 상태</h1>
          <p className="mt-1 text-[13px] text-gray-500">GET /api/health</p>

          <div className="mt-4 text-[15px]" role="status" aria-live="polite">
            {status.state === 'loading' && <span className="text-gray-500">확인 중…</span>}
            {status.state === 'ok' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  연결됨
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-semibold">
                  v{status.data.version}
                </span>
                <span
                  className={
                    'rounded-full px-2 py-0.5 text-[12px] font-semibold ' +
                    (status.data.mock ? 'bg-orange-50 text-flame' : 'bg-indigo-50 text-cobalt')
                  }
                >
                  {status.data.mock ? 'Mock 모드' : 'Claude API 모드'}
                </span>
              </div>
            )}
            {status.state === 'error' && (
              <div className="text-red-700">
                <b>연결 실패</b> · {status.message}
                <p className="mt-1 text-[13px] text-gray-600">
                  서버가 켜져 있는지 확인하세요 (루트에서 <code>npm run dev</code>).
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={check}
            className="mt-5 h-11 rounded-lg bg-cobalt px-4 text-[14.5px] font-bold text-white hover:bg-[#1c41c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2"
          >
            다시 확인
          </button>
        </section>
      </main>
    </div>
  );
}
