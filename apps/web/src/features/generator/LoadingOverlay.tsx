import { useEffect, useState } from 'react';
import { FRAMEWORKS, LEVEL_LABEL, type FrameworkId, type Level } from '@obp/shared';
import type { RequestMode } from '../../app/state';
import { IconCheck } from './icons';

// 진행 단계 표시는 연출입니다. 응답이 오면 즉시 닫힙니다 — docs/02_ui-spec.md#3-로딩-오버레이
const STEPS: Record<RequestMode, string[]> = {
  new: ['선택 조건 분석', '화면 유형과 업무 정하기', '개발 명세서 작성', '예시 화면 그리기'],
  next: ['다른 화면 유형 찾기', '업무 정하기', '개발 명세서 작성', '예시 화면 그리기'],
};

type Props = { mode: RequestMode; framework: FrameworkId; level: Level };

export function LoadingOverlay({ mode, framework, level }: Props) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS[mode].length - 1)), 600);
    return () => clearInterval(t);
  }, [mode]);

  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/80 pt-24 backdrop-blur-[2px]">
      <div className="w-[min(380px,90%)] rounded-2xl border border-gray-200 bg-white p-5 shadow-xl" role="status" aria-live="polite">
        <div className="text-[15px] font-bold">
          {mode === 'next' ? '다른 과제 아이디어를 찾는 중' : `${FRAMEWORKS[framework].label} · ${LEVEL_LABEL[level]} 과제를 만드는 중`}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div className="progress h-full rounded-full bg-cobalt" />
        </div>
        <ul className="mt-4 space-y-2 text-[14px]">
          {STEPS[mode].map((t, i) => (
            <li key={t} className={'flex items-center gap-2.5 ' + (i <= step ? 'text-ink' : 'text-gray-400')}>
              {i < step ? (
                <span className="text-emerald-600">
                  <IconCheck />
                </span>
              ) : i === step ? (
                <span className="grid h-4 w-4 place-items-center">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cobalt" />
                </span>
              ) : (
                <span className="h-4 w-4 rounded-full border-2 border-gray-200" />
              )}
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
