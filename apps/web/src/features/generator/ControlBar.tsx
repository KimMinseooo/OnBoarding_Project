import { FRAMEWORK_IDS, FRAMEWORKS, LEVELS, LEVEL_LABEL, type FrameworkId, type Level } from '@obp/shared';
import { BTN } from './ui';
import { IconChevron, IconSpark, Spinner } from './icons';

const LEVEL_SUB: Record<Level, string> = { basic: '기초 UI', intermediate: '실무 CRUD' };

type Props = {
  framework: FrameworkId;
  level: Level;
  loading: boolean;
  dirty: boolean;
  onSelect: (v: { framework?: FrameworkId; level?: Level }) => void;
  onGenerate: () => void;
};

/** 상단 컨트롤 바 — docs/02_ui-spec.md#2-상단-컨트롤-바 */
export function ControlBar({ framework, level, loading, dirty, onSelect, onGenerate }: Props) {
  return (
    <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-end gap-x-4 gap-y-3 px-4 py-3.5 sm:px-6">
        <label className="block w-full sm:w-56">
          <span className="mb-1 block text-[13px] font-semibold text-gray-600">언어 / 프레임워크</span>
          <span className="relative block">
            <select
              value={framework}
              onChange={(e) => onSelect({ framework: e.target.value as FrameworkId })}
              className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white pr-9 pl-3 text-[16px] font-semibold focus:ring-2 focus:ring-cobalt focus:outline-none"
            >
              {FRAMEWORK_IDS.map((id) => (
                <option key={id} value={id}>
                  {FRAMEWORKS[id].label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-600">
              <IconChevron />
            </span>
          </span>
        </label>

        <div>
          <span className="mb-1 block text-[13px] font-semibold text-gray-600">난이도</span>
          <div role="radiogroup" aria-label="난이도" className="inline-flex h-11 rounded-lg bg-gray-100 p-1">
            {LEVELS.map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={level === v}
                onClick={() => onSelect({ level: v })}
                className={
                  'flex min-w-[88px] items-baseline justify-center gap-1 rounded-md px-3 text-[15px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ' +
                  (level === v ? 'bg-white text-ink shadow-sm' : 'text-gray-500 hover:text-ink')
                }
              >
                {LEVEL_LABEL[v]}
                <span className="text-[11px] font-semibold text-gray-400">{LEVEL_SUB[v]}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={onGenerate} disabled={loading} className={`${BTN} bg-cobalt px-5 text-white shadow-sm hover:bg-[#1c41c4]`}>
          {loading ? <Spinner /> : <IconSpark />}
          {loading ? '생성 중…' : '과제 및 예시 화면 생성'}
        </button>

        {dirty && !loading && (
          <p className="rise flex items-center gap-1.5 pb-3 text-[13px] text-flame">
            <span className="h-1.5 w-1.5 rounded-full bg-flame" />
            선택이 바뀌었어요. 생성 버튼을 누르면 새 아이디어를 제안해요.
          </p>
        )}
      </div>
    </div>
  );
}
