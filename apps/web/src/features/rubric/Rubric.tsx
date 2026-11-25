import { useState } from 'react';
import { gradeOf, type RubricGroup } from '@obp/shared';
import { IconCheck } from '../generator/icons';

const GRADE_COLOR: Record<string, string> = { A: '#2b8a3e', B: '#1c7ed6', C: '#d9480f' };

/** 채점표 — 필수 100점 + 가산점 별도, 등급 기준은 docs/05_assignment-rules.md#등급 */
export function Rubric({ groups }: { groups: RubricGroup[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const got = (g: RubricGroup) => g.items.reduce((t, it, i) => t + (checked[`${g.group}#${i}`] ? it.points : 0), 0);
  const total = groups.filter((g) => !g.bonus).reduce((t, g) => t + got(g), 0);
  const bonus = groups.filter((g) => g.bonus).reduce((t, g) => t + got(g), 0);
  const grade = gradeOf(total);
  const color = GRADE_COLOR[grade[0]!] ?? '#868e96';

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-bold">평가 기준 (채점표)</h3>
          <p className="text-[12.5px] text-gray-500">사수가 리뷰하며 체크해 보세요.</p>
        </div>
        <div className="text-right">
          <div className="text-[26px] leading-none font-extrabold tabular-nums">
            {total}
            <span className="text-[14px] font-bold text-gray-400"> / 100</span>
            {bonus > 0 && <span className="ml-1 text-[14px] font-bold text-flame">+{bonus}</span>}
          </div>
          <div className="mt-1 text-[12.5px] font-bold" style={{ color }}>
            {grade}
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${total}%`, background: color }} />
      </div>

      <div className="mt-3 space-y-3">
        {groups.map((g) => {
          const max = g.items.reduce((t, it) => t + it.points, 0);
          return (
            <div key={g.group} className={g.bonus ? '-mx-1 rounded-lg bg-orange-50/60 p-2' : ''}>
              <div className="flex justify-between text-[13px] font-bold">
                <span className={g.bonus ? 'text-flame' : ''}>{g.group}</span>
                <span className="text-gray-500 tabular-nums">{g.bonus ? `+${got(g)}` : `${got(g)} / ${max}`}</span>
              </div>
              {g.bonus && <p className="text-[12px] text-gray-500">합격 판정에는 들어가지 않아요. 필수 기능을 모두 끝낸 경우에만 채점합니다.</p>}
              <ul className="mt-1">
                {g.items.map((it, i) => {
                  const id = `${g.group}#${i}`;
                  const on = !!checked[id];
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => setChecked({ ...checked, [id]: !on })}
                        className="flex min-h-[44px] w-full items-start gap-2.5 rounded-md px-1.5 py-2 text-left text-[13.5px] leading-snug hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                      >
                        <span
                          className={
                            'mt-px grid h-[18px] w-[18px] flex-none place-items-center rounded border ' +
                            (on ? 'border-cobalt bg-cobalt text-white' : 'border-gray-300 bg-white')
                          }
                        >
                          {on && <IconCheck size={12} />}
                        </span>
                        <span className={'flex-1 ' + (on ? 'text-gray-500' : 'text-gray-800')}>{it.text}</span>
                        <span className="flex-none text-[12.5px] font-bold text-gray-400 tabular-nums">
                          {g.bonus ? '+' : ''}
                          {it.points}점
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      {total + bonus > 0 && (
        <button type="button" onClick={() => setChecked({})} className="mt-2 h-11 text-[13px] font-semibold text-gray-500 underline underline-offset-2">
          체크 모두 해제
        </button>
      )}
    </section>
  );
}
