import { useState } from 'react';
import { FRAMEWORKS, LAYOUTS, type Assignment } from '@obp/shared';
import { initialSelection, renderMockup } from './frame';

/** 예시 화면 뷰어 — docs/02_ui-spec.md#6-예시-화면-뷰어 (과제가 바뀌면 key로 새로 그려 선택 상태 초기화) */
export function MockupViewer({ a }: { a: Assignment }) {
  const [ann, setAnn] = useState(true);
  const [zoom, setZoom] = useState(false);
  const [sel, setSel] = useState(() => initialSelection(a.layout));
  const { svg, pins } = renderMockup(a, sel, setSel, ann);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
        <div>
          <div className="text-[15px] font-bold">구현 목표 예시 화면</div>
          <div className="text-[12.5px] text-gray-500">
            {FRAMEWORKS[a.framework].platform} · {LAYOUTS[a.layout].name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnn(!ann)}
            aria-pressed={ann}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-300 px-3 text-[13px] font-semibold hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
          >
            <span className={'relative h-5 w-9 rounded-full transition ' + (ann ? 'bg-flame' : 'bg-gray-300')}>
              <span className={'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ' + (ann ? 'left-[18px]' : 'left-0.5')} />
            </span>
            컨트롤 이름
          </button>
          <button
            type="button"
            onClick={() => setZoom(!zoom)}
            aria-pressed={zoom}
            className="h-11 rounded-lg border border-gray-300 px-3 text-[13px] font-semibold hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
          >
            {zoom ? '화면에 맞춤' : '원본 크기'}
          </button>
        </div>
      </div>
      <div className="blueprint overflow-x-auto">
        <div className="rise p-2 sm:p-4" style={{ minWidth: zoom ? 860 : 0 }}>
          {svg}
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="text-[13px] text-gray-500">목록·카드·단계·탭처럼 "(클릭)"이 붙은 부분은 눌러서 바뀌는 모습을 볼 수 있어요. 주황색 "선택" 표시는 가산점 기능이에요.</p>
        {ann && (
          <ol className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
            {pins.map((p, i) => (
              <li key={p.key} className="flex items-start gap-2.5 text-[13px] leading-snug">
                <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-flame text-[11px] font-bold text-white">{i + 1}</span>
                <span>
                  <span className="font-mono text-[12.5px] font-medium text-ink">{p.name}</span>
                  <span className="block text-gray-500">{p.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
