import { DELIVERABLES, FRAMEWORKS, LAYOUTS, LEVEL_LABEL, type Assignment } from '@obp/shared';
import { Rubric } from '../rubric/Rubric';
import { IconWarn } from '../generator/icons';

// 명세서 패널 — 섹션 순서는 docs/02_ui-spec.md#5-명세서-패널

const KEY_COLOR: Record<string, [string, string]> = {
  R: ['#2450e6', '#eef2ff'],
  C: ['#2b8a3e', '#ebfbee'],
  U: ['#c2410c', '#fff4e6'],
  D: ['#c92a2a', '#fff5f5'],
  '1': ['#2450e6', '#eef2ff'],
  '2': ['#0c8599', '#e3fafc'],
  '3': ['#2b8a3e', '#ebfbee'],
  '4': ['#c2410c', '#fff4e6'],
};
const LAYER_COLOR: [string, string][] = [
  ['#2450e6', '#eef2ff'],
  ['#c2410c', '#fff4e6'],
  ['#2b8a3e', '#ebfbee'],
];

const days = ({ min, max }: Assignment['estimatedDays']) => (min === max ? `${min}일` : `${min}~${max}일`);
const Dot = ({ color = 'bg-gray-400' }: { color?: string }) => <span className={`mt-[7px] h-1 w-1 flex-none rounded-full ${color}`} />;

function Bullets({ items, color }: { items: string[]; color?: string }) {
  return (
    <ul className="mt-2.5 space-y-1.5 text-[13.5px] leading-snug text-gray-700">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2">
          <Dot color={color} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function SpecPanel({ a }: { a: Assignment }) {
  const basic = a.level === 'basic';
  const tone = basic ? 'bg-indigo-50 text-cobalt' : 'bg-orange-50 text-flame';
  return (
    <div className="rise space-y-5">
      {/* 1~2. 개요 */}
      <section>
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="rounded-full bg-ink px-2.5 py-0.5 font-semibold text-white">{FRAMEWORKS[a.framework].label}</span>
          <span className={`rounded-full px-2.5 py-0.5 font-semibold ${tone}`}>{LEVEL_LABEL[a.level]}</span>
          <span className="text-gray-500">{basic ? '기초 UI 과제 · CRUD 없음' : '실무 CRUD 과제 · DB 연동'}</span>
        </div>
        <h2 className="mt-3 text-[26px] leading-tight font-extrabold tracking-tight text-balance">{a.title}</h2>
        <p className="mt-2.5 text-[15.5px] leading-relaxed text-gray-700">{a.scenario}</p>
        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 text-[13px] sm:grid-cols-3">
          <div className="bg-white px-3 py-2.5">
            <dt className="text-gray-500">화면 유형</dt>
            <dd className="mt-0.5 font-bold">{LAYOUTS[a.layout].name}</dd>
          </div>
          <div className="bg-white px-3 py-2.5">
            <dt className="text-gray-500">예상 소요</dt>
            <dd className="mt-0.5 font-bold">{days(a.estimatedDays)}</dd>
          </div>
          <div className="col-span-2 bg-white px-3 py-2.5 sm:col-span-1">
            <dt className="text-gray-500">산출물</dt>
            <dd className="mt-0.5 font-bold">{DELIVERABLES[a.level]}</dd>
          </div>
        </dl>
        <p className="mt-3 rounded-lg bg-gray-50 px-3.5 py-3 text-[14px]">
          <b>학습 목표</b>
          <span className="text-gray-700"> · {a.learningGoal}</span>
        </p>
      </section>

      {/* 3. 컨트롤·기술 */}
      <section>
        <h3 className="text-[15px] font-bold">필수 사용 컨트롤</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {a.controls.map((t) => (
            <span key={t} className="rounded-md border border-gray-300 bg-white px-2 py-1 font-mono text-[12.5px] text-gray-800">
              {t}
            </span>
          ))}
        </div>
        <h3 className="mt-4 text-[15px] font-bold">핵심 기술</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {a.tech.map((t) => (
            <span key={t} className={`rounded-md px-2 py-1 text-[12.5px] font-semibold ${tone}`}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* 4. 코드 구조 */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-[15px] font-bold">코드 구조 · {a.architecture.title}</h3>
        <div className="mt-3">
          {a.architecture.layers.map((l, i) => {
            const [fg, bg] = LAYER_COLOR[i % 3]!;
            return (
              <div key={l.name}>
                {i > 0 && (
                  <div className="flex h-6 items-center pl-6 text-gray-400" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M12 4v15M6 13l6 6 6-6" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5 rounded-lg border px-3 py-2.5" style={{ borderColor: bg, background: `${bg}99` }}>
                  <div className="w-[118px] flex-none">
                    <div className="text-[13.5px] font-extrabold" style={{ color: fg }}>
                      {l.name}
                    </div>
                    <div className="text-[12px] leading-snug text-gray-600">{l.role}</div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                    {l.files.map((f) => (
                      <code key={f} className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-gray-800 ring-1 ring-gray-200">
                        {f}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {a.architecture.common && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12.5px] text-gray-500">
            공통 모델
            {a.architecture.common.map((f) => (
              <code key={f} className="rounded bg-gray-50 px-1.5 py-0.5 font-mono text-[12px] text-gray-700 ring-1 ring-gray-200">
                {f}
              </code>
            ))}
          </div>
        )}
        <Bullets items={a.architecture.rules} />
        {a.architecture.note && <p className="mt-2 text-[12.5px] text-gray-500">{a.architecture.note}</p>}
      </section>

      {/* 5. 요구사항 */}
      <section>
        <h3 className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
          {basic ? '기능 요구사항' : '기능별 CRUD 요구사항'}
          <span className="rounded bg-ink px-1.5 py-px text-[11px] font-bold text-white">필수</span>
        </h3>
        <p className="mt-1 text-[13px] text-gray-500">이 항목만 완성하면 과제 통과 기준을 채울 수 있어요.</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {a.requirements.map((r) => {
            const [fg, bg] = KEY_COLOR[r.key] ?? KEY_COLOR['1']!;
            return (
              <article key={r.key} className="rounded-xl border border-gray-200 bg-white p-4">
                <header className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-md text-[13px] font-extrabold" style={{ color: fg, background: bg }}>
                    {r.key}
                  </span>
                  <h4 className="text-[15px] font-bold">{r.name}</h4>
                </header>
                <Bullets items={r.items} />
              </article>
            );
          })}
        </div>
      </section>

      {/* 6. 선택 기능 */}
      <section className="rounded-xl border border-dashed border-orange-300 bg-orange-50/40 p-4">
        <h3 className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
          선택 기능
          <span className="rounded bg-orange-100 px-1.5 py-px text-[11px] font-bold text-flame">가산점</span>
        </h3>
        <p className="mt-1 text-[13px] text-gray-600">편의 기능이에요. 필수 기능을 모두 끝내고 시간이 남을 때만 도전하세요. 하지 않아도 감점은 없어요.</p>
        <Bullets items={a.optionalFeatures} color="bg-flame" />
      </section>

      {/* 7. 구현 힌트 (초급) */}
      {a.hints && (
        <section className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
          <h3 className="text-[15px] font-bold">{FRAMEWORKS[a.framework].label} 구현 힌트</h3>
          <Bullets items={a.hints} color="bg-cobalt" />
        </section>
      )}

      {/* 8. 예외 처리 */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
        <h3 className="flex items-center gap-2 text-[15px] font-bold">
          <IconWarn />
          예외 처리 조건
        </h3>
        <ol className="mt-2.5 space-y-1.5 text-[13.5px] leading-snug text-gray-800">
          {a.exceptions.map((t, i) => (
            <li key={t} className="flex gap-2.5">
              <span className="w-5 flex-none text-right font-bold text-amber-700 tabular-nums">{i + 1}.</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 9. 데이터 설계 가이드 (중급) */}
      {a.dataGuide && (
        <section className="rounded-xl border border-dashed border-gray-300 bg-white p-4">
          <h3 className="text-[15px] font-bold">데이터·API 설계 가이드</h3>
          <p className="mt-1 text-[13px] text-gray-500">테이블 명세는 주지 않아요. 아래 질문에 답하면서 직접 설계해 보세요.</p>
          <ol className="mt-2.5 space-y-1.5 text-[13.5px] leading-snug text-gray-800">
            {a.dataGuide.questions.map((t, i) => (
              <li key={t} className="flex gap-2.5">
                <span className="w-6 flex-none text-right font-bold text-gray-400 tabular-nums">Q{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-[13px]">
            <b>제출:</b> {a.dataGuide.deliverable}
          </p>
        </section>
      )}

      {/* 10. 채점표 */}
      <Rubric key={a.id} groups={a.rubric} />
    </div>
  );
}
