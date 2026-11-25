import { useState } from 'react';
import { FRAMEWORKS, LAYOUTS, LEVEL_LABEL, type Assignment } from '@obp/shared';
import type { Entry, ProposalStatus } from '../../app/state';
import { IconCheck, IconRefresh } from './icons';
import { BTN, BTN_OUTLINE, STATUS_STYLE } from './ui';

type Props = {
  history: Entry[];
  current: number;
  loading: boolean;
  notice: string | null;
  onNext: () => void;
  onStatus: (status: ProposalStatus) => void;
  onOpen: (index: number) => void;
  onClear: () => void;
};

/** 내보내기 코드는 누를 때만 불러옵니다 (react-dom/server 포함) */
async function exportFile(a: Assignment, kind: 'markdown' | 'svg') {
  const { buildExport, download } = await import('../export/exportFiles');
  download(buildExport(a)[kind]);
}

function ExportButtons({ a }: { a: Assignment }) {
  const [error, setError] = useState('');
  const run = (kind: 'markdown' | 'svg') => exportFile(a, kind).then(() => setError(''), (e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-emerald-200 pt-3">
      <span className="mr-1 text-[13px] text-emerald-800">신입사원에게 전달할 파일</span>
      <button type="button" onClick={() => void run('markdown')} className={`${BTN} bg-emerald-700 text-white hover:bg-emerald-800`}>
        명세서 내보내기 (.md)
      </button>
      <button type="button" onClick={() => void run('svg')} className={`${BTN_OUTLINE} border-emerald-300 text-emerald-800`}>
        예시 화면 내보내기 (.svg)
      </button>
      <span className="w-full text-[12.5px] text-gray-500">두 파일을 같은 폴더에 두면 명세서 안에 예시 화면이 함께 보여요.</span>
      {error && <span role="alert" className="w-full text-[12.5px] text-red-700">내보내지 못했어요: {error}</span>}
    </div>
  );
}

/** 결정 바 + 제안 기록 — docs/02_ui-spec.md#4-결정-바 */
export function DecisionBar({ history, current, loading, notice, onNext, onStatus, onOpen, onClear }: Props) {
  const e = history[current];
  if (!e) return null;
  const a = e.assignment;
  const [label, cls] = STATUS_STYLE[e.status];

  return (
    <section
      className={'rise mb-5 rounded-2xl border p-4 sm:p-5 ' + (e.status === 'adopted' ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-white')}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-500">
            <span className="font-semibold">아이디어 {current + 1}</span>
            <span>·</span>
            <span>
              {FRAMEWORKS[a.framework].label} {LEVEL_LABEL[a.level]}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold ring-1 ${cls}`}>{label}</span>
          </div>
          <h2 className="mt-1 text-[19px] leading-snug font-extrabold">{a.title}</h2>
          <div className="mt-0.5 text-[13px] text-gray-500">
            화면 유형: <b className="text-gray-700">{LAYOUTS[a.layout].name}</b> · 요청 부서 예시: {a.team}
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          {e.status === 'adopted' ? (
            <>
              <button type="button" onClick={() => onStatus('proposed')} className={`${BTN_OUTLINE} flex-1 text-gray-700 sm:flex-none`}>
                채택 취소
              </button>
              <button type="button" onClick={onNext} disabled={loading} className={`${BTN_OUTLINE} flex-1 sm:flex-none`}>
                <IconRefresh />
                다른 아이디어도 보기
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onNext} disabled={loading} className={`${BTN_OUTLINE} flex-1 sm:flex-none`}>
                <IconRefresh />
                {e.status === 'rejected' ? '다른 아이디어 보기' : '넘기고 다른 아이디어'}
              </button>
              <button type="button" onClick={() => onStatus('adopted')} className={`${BTN} flex-1 bg-ink text-white hover:bg-black sm:flex-none`}>
                <IconCheck />
                {e.status === 'rejected' ? '다시 검토해 채택' : '이 과제로 채택'}
              </button>
            </>
          )}
        </div>
      </div>
      {e.status === 'adopted' && <ExportButtons a={a} />}
      {notice && <p className="mt-3 text-[13px] text-flame">{notice}</p>}

      {history.length > 1 && (
        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="mb-2 flex items-center justify-between gap-2 text-[12.5px] font-semibold text-gray-500">
            <span>제안 기록 · 눌러서 다시 보기 (이 브라우저에 저장됨)</span>
            <button type="button" onClick={onClear} disabled={loading} className="rounded px-2 py-1 font-medium text-gray-500 underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50">
              기록 비우기
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {history.map((h, i) => {
              const [l, c] = STATUS_STYLE[h.status];
              return (
                <button
                  key={h.assignment.id}
                  type="button"
                  onClick={() => onOpen(i)}
                  aria-current={i === current}
                  className={
                    'flex h-11 flex-none items-center gap-2 rounded-lg border px-3 text-left text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ' +
                    (i === current ? 'border-ink bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-400')
                  }
                >
                  <span className="font-bold text-gray-400 tabular-nums">{i + 1}</span>
                  <span className={'font-semibold whitespace-nowrap ' + (h.status === 'rejected' ? 'text-gray-400' : 'text-ink')}>
                    {h.assignment.title}
                  </span>
                  <span className="text-[12px] whitespace-nowrap text-gray-400">
                    {FRAMEWORKS[h.assignment.framework].label} {LEVEL_LABEL[h.assignment.level]}
                  </span>
                  <span className={`rounded-full px-1.5 py-px text-[11px] font-bold whitespace-nowrap ring-1 ${c}`}>{l}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
