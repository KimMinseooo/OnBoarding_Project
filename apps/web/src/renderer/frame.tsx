import type { ReactNode } from 'react';
import { FRAMEWORKS, LAYOUTS, controlName, type Assignment, type ControlKey, type LayoutId } from '@obp/shared';
import { SKINS, T, tw, type Pos } from './kit';
import { LAYOUT_RENDERERS } from './layouts';
import type { LayoutCtx, LayoutFn, LayoutResult } from './layouts/types';
import { Pins, type PinItem } from './widgets';

const W = 780;

/** 화면 유형별로 처음 선택해 둘 항목 (설정 화면은 첫 탭, 나머지는 두 번째 항목) */
export const initialSelection = (layout: LayoutId) => (layout === 'settings' ? 0 : 1);

function runLayout(a: Assignment, ctx: Omit<LayoutCtx<LayoutId>, 'a' | 'd'>, box: { x: number; y: number; w: number }): LayoutResult {
  // 스키마가 layout과 data 형식을 함께 보장하므로 여기서는 그대로 넘깁니다
  const fn = LAYOUT_RENDERERS[a.layout] as LayoutFn<LayoutId>;
  return fn({ ...ctx, a, d: a.mockup.data } as LayoutCtx<LayoutId>, box);
}

/**
 * 과제 하나를 예시 화면 SVG로 그립니다. 범례에 쓸 핀 목록도 함께 돌려줍니다.
 * 데스크톱은 창 틀(제목줄·메뉴·상태줄), 웹은 브라우저 틀(탭·주소창·상단 메뉴)을 씌웁니다.
 */
export function renderMockup(a: Assignment, sel: number, setSel: (i: number) => void, showPins: boolean): { svg: ReactNode; pins: PinItem[] } {
  const k = SKINS[a.framework];
  const fw = FRAMEWORKS[a.framework];
  const frame: ReactNode[] = [];
  const fp: Pos = {};
  let result: LayoutResult;
  let H: number;
  const framePins: { key: string; control: ControlKey; desc: string }[] = [];

  if (!k.web) {
    frame.push(
      <g key="title">
        <rect x={0} y={0} width={W} height={32} rx={k.frame} fill={k.title} />
        <rect x={0} y={16} width={W} height={16} fill={k.title} />
        <line x1={0} x2={W} y1={31.5} y2={31.5} stroke="#e3e3e3" />
        <rect x={12} y={9} width={14} height={14} rx={3} fill={k.accent} />
        <rect x={15} y={12} width={8} height={2} fill="#fff" />
        <rect x={15} y={16} width={5} height={2} fill="#fff" />
        {T(34, 20.5, a.mockup.appTitle)}
        <line x1={W - 133} x2={W - 123} y1={16.5} y2={16.5} stroke="#333" />
        <rect x={W - 82.5} y={11.5} width={10} height={10} fill="none" stroke="#333" />
        <path d={`M${W - 28} 11 l10 10 M${W - 18} 11 l-10 10`} stroke="#333" />
      </g>,
    );
    fp.title = { x: 0, y: 0, w: W, h: 32 };
    framePins.push({ key: 'title', control: 'window', desc: `제목: ${a.mockup.appTitle}` });
    let y = 32;
    if (a.mockup.menu) {
      frame.push(
        <g key="menu">
          <rect x={0} y={y} width={W} height={22} fill={k.menuBg} />
          {a.mockup.menu.map((m, i) => (
            <g key={m}>{T(12 + i * 72, y + 15, m)}</g>
          ))}
        </g>,
      );
      fp.menu = { x: 0, y, w: W, h: 22 };
      framePins.push({ key: 'menu', control: 'menu', desc: '상단 메뉴' });
      y += 22;
    }
    const box = { x: 16, y: y + 18, w: W - 32 };
    result = runLayout(a, { k, sel, setSel }, box);
    const sy = box.y + result.h + 16;
    frame.push(
      <g key="status">
        <rect x={0} y={sy} width={W} height={24} fill={k.status} />
        <line x1={0} x2={W} y1={sy + 0.5} y2={sy + 0.5} stroke="#d9d9d9" />
        {T(12, sy + 16, result.status, { fs: 11.5, c: '#333' })}
        {T(W - 14, sy + 16, '준비', { fs: 11.5, a: 'end', c: '#333' })}
      </g>,
    );
    fp.status = { x: 0, y: sy, w: W, h: 24 };
    H = sy + 24;
  } else {
    const ac = k.accent;
    frame.push(
      <g key="chrome">
        <rect x={0} y={0} width={W} height={36} fill="#e3e6ea" />
        <path d="M8 36 V12 a6 6 0 0 1 6 -6 H226 a6 6 0 0 1 6 6 V36 Z" fill="#fff" />
        <circle cx={24} cy={21} r={6} fill={ac} />
        {T(38, 25, a.mockup.appTitle, { fs: 11.5, c: '#333' })}
        <path d="M212 17 l7 7 M219 17 l-7 7" stroke="#777" />
        <line x1={W - 133} x2={W - 123} y1={18.5} y2={18.5} stroke="#333" />
        <rect x={W - 82.5} y={13.5} width={10} height={10} fill="none" stroke="#333" />
        <path d={`M${W - 28} 13 l10 10 M${W - 18} 13 l-10 10`} stroke="#333" />
        <rect x={0} y={36} width={W} height={34} fill="#fff" />
        <line x1={0} x2={W} y1={69.5} y2={69.5} stroke="#e1e3e6" />
        <path d="M22 53 h-9 m4 -4 l-4 4 l4 4 M38 53 h9 m-4 -4 l4 4 l-4 4" stroke="#666" fill="none" strokeWidth={1.3} />
        <path d="M68 48 a5.5 5.5 0 1 0 4 2" stroke="#666" fill="none" strokeWidth={1.3} />
        <rect x={88} y={42} width={W - 140} height={22} rx={11} fill="#f1f3f4" />
        <rect x={100} y={51} width={8} height={7} rx={1} fill="#666" />
        <path d="M101.5 51 v-2 a2.5 2.5 0 0 1 5 0 v2" stroke="#666" fill="none" />
        {T(116, 57, a.mockup.url ?? '', { fs: 11.5, c: '#333' })}
      </g>,
    );
    fp.browser = { x: 0, y: 0, w: W, h: 70 };
    framePins.push({ key: 'browser', control: 'window', desc: a.mockup.url ?? fw.platform });
    let nx = 210;
    const nav = (a.mockup.nav ?? [a.title]).map((t, i) => {
      const x0 = nx;
      nx += tw(t, 13) + 30;
      return (
        <g key={t}>
          {T(x0, 99, t, { fs: 13, fw: i === 0 ? 700 : 500, c: i === 0 ? ac : '#4b5563' })}
          {i === 0 && <rect x={x0} y={115} width={tw(t, 13)} height={3} rx={1.5} fill={ac} />}
        </g>
      );
    });
    frame.push(
      <g key="appbar">
        <rect x={0} y={70} width={W} height={48} fill="#fff" />
        <line x1={0} x2={W} y1={117.5} y2={117.5} stroke="#e5e7eb" />
        <rect x={20} y={83} width={22} height={22} rx={6} fill={ac} />
        {T(50, 99, a.mockup.appTitle, { fs: 14, fw: 800, c: '#111827' })}
        {nav}
        <circle cx={W - 34} cy={94} r={13} fill={ac} fillOpacity={0.14} />
        {T(W - 34, 98.5, '나', { fs: 11, fw: 700, a: 'middle', c: ac })}
      </g>,
    );
    fp.appNav = { x: 204, y: 78, w: nx - 210, h: 34 };
    framePins.push({ key: 'appNav', control: 'menu', desc: '상단 메뉴' });
    const box = { x: 22, y: 138, w: W - 44 };
    result = runLayout(a, { k, sel, setSel }, box);
    H = box.y + result.h + 26;
  }

  const pos: Pos = { ...fp, ...result.pos };
  const tail = k.web ? [] : [{ key: 'status', control: 'status' as ControlKey, desc: '상태 표시' }];
  const pins: PinItem[] = [...framePins, ...LAYOUTS[a.layout].pins, ...tail]
    .filter((p) => pos[p.key])
    .map((p) => ({ key: p.key, name: controlName(a.framework, p.control), desc: p.desc }));

  const svg = (
    <svg
      viewBox={`-24 -20 ${W + 48} ${H + 48}`}
      width="100%"
      role="img"
      aria-label={`${a.title} 예시 화면`}
      style={{ display: 'block', fontFamily: k.web ? "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif" : "'Segoe UI','Malgun Gothic','Apple SD Gothic Neo',sans-serif" }}
    >
      <defs>
        <filter id="mk-wsh" x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx={0} dy={8} stdDeviation={10} floodOpacity={0.18} />
        </filter>
        <filter id="mk-dsh" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx={0} dy={6} stdDeviation={8} floodOpacity={0.22} />
        </filter>
        <clipPath id="mk-clip">
          <rect x={0} y={0} width={W} height={H} rx={k.frame} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={W} height={H} rx={k.frame} fill={k.win} filter="url(#mk-wsh)" />
      <g clipPath="url(#mk-clip)">
        {frame}
        <g>{result.els}</g>
      </g>
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={k.frame} fill="none" stroke={k.web ? '#c9ccd1' : k.id === 'wpf' ? '#c4c4c4' : '#8a8a8a'} />
      {showPins && <Pins list={pins} pos={pos} />}
    </svg>
  );
  return { svg, pins };
}
