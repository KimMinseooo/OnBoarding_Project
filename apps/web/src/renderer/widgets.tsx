import type { ReactNode } from 'react';
import { Check, Click, INK, MU, T, tw, widths, type Pos, type Skin } from './kit';

// 여러 줄·여러 칸으로 된 컨트롤: 목록, 탭, 표, 트리, 대화상자, 단계 표시, 주석 핀

export type ListItem = { t: string; s?: string; done?: boolean; tag?: string; tagColor?: string; dot?: string };
export function List(k: Skin, x: number, y: number, w: number, items: ListItem[], o: { rh: number; sel: number; onSel?: (i: number) => void; check?: boolean; two?: boolean }) {
  const h = items.length * o.rh + 2;
  const ink = INK(k);
  return {
    h,
    el: (
      <g>
        <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={k.web ? 10 : k.r} fill={k.ctrl} stroke={k.web ? k.gb : k.bd} />
        {items.map((it, i) => {
          const ry = y + 1 + i * o.rh;
          const on = i === o.sel;
          const white = on && k.selInk === '#ffffff';
          const c = white ? '#fff' : it.done ? '#9a9a9a' : ink;
          const tx = x + (o.check ? 32 : 12);
          return (
            <Click key={i} onClick={o.onSel && (() => o.onSel!(i))}>
              <rect x={x + 1} y={ry} width={w - 2} height={o.rh} rx={k.web ? 8 : 0} fill={on ? k.sel : 'transparent'} />
              {i > 0 && !on && (k.web || o.two) && <line x1={x + 10} x2={x + w - 10} y1={ry + 0.5} y2={ry + 0.5} stroke={k.web ? '#f0f1f3' : '#e6e6e6'} />}
              {o.check && Check(k, x + 10, ry + (o.rh - k.ch) / 2, '', !!it.done).el}
              {o.two ? (
                <g>
                  {T(tx, ry + 18, it.t, { fw: 700, c })}
                  {T(tx, ry + 34, it.s ?? '', { fs: 11, c: white ? '#e6f0ff' : MU(k) })}
                </g>
              ) : (
                T(tx, ry + o.rh / 2 + 4, it.t, { c, del: it.done })
              )}
              {it.tag && T(x + w - 12, ry + o.rh / 2 + 4, it.tag, { fs: 11, fw: 700, a: 'end', c: white ? '#fff' : it.tagColor })}
              {it.dot && <circle cx={x + w - 16} cy={ry + o.rh / 2} r={4.5} fill={it.dot} />}
            </Click>
          );
        })}
      </g>
    ),
  };
}

export function Tabs(k: Skin, x: number, y: number, w: number, h: number, tabs: string[], act: number, onTab?: (i: number) => void) {
  const th = k.web ? 40 : 26;
  let tx = x + (k.web ? 16 : 2);
  const heads: ReactNode[] = [];
  tabs.forEach((t, i) => {
    const tw_ = tw(t, 12.5) + (k.web ? 0 : 28);
    const on = i === act;
    const x0 = tx;
    heads.push(
      <Click key={i} onClick={onTab && (() => onTab(i))}>
        {k.web ? (
          <g>
            <rect x={x0 - 6} y={y + 6} width={tw_ + 12} height={th - 8} fill="transparent" />
            {T(x0, y + 25, t, { fs: 13, fw: on ? 700 : 500, c: on ? k.accent : '#6b7280' })}
            {on && <rect x={x0} y={y + th - 2} width={tw_} height={2.5} rx={1} fill={k.accent} />}
          </g>
        ) : (
          <g>
            <rect x={x0} y={on ? y : y + 3} width={tw_} height={on ? th : th - 3} fill={on ? k.panel : k.tabBg} stroke={k.id === 'wpf' ? '#d0d0d0' : k.bd} />
            {on && <rect x={x0 + 1} y={y + th - 1.5} width={tw_ - 2} height={3} fill={k.panel} />}
            {T(x0 + tw_ / 2, y + (on ? 17 : 19), t, { a: 'middle', fw: on && k.id === 'wpf' ? 600 : 400 })}
          </g>
        )}
      </Click>,
    );
    tx += tw_ + (k.web ? 24 : 0);
  });
  const panel = k.web ? (
    <g>
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={10} fill="#fff" stroke={k.gb} />
      <line x1={x} x2={x + w} y1={y + th + 0.5} y2={y + th + 0.5} stroke={k.gb} />
    </g>
  ) : (
    <rect x={x + 0.5} y={y + th - 0.5} width={w - 1} height={h - th} fill={k.panel} stroke={k.id === 'wpf' ? '#d0d0d0' : k.bd} />
  );
  return {
    top: y + th + (k.web ? 18 : 16),
    th,
    headWidth: tx - x,
    el: (
      <g>
        {panel}
        {heads}
      </g>
    ),
  };
}

export type Column = { header: string; width: number; align?: 'right' };
export function Grid(
  k: Skin,
  x: number,
  y: number,
  w: number,
  cols: Column[],
  rows: string[][],
  o: { sel?: number; onSel?: (i: number) => void; statusColors?: Record<string, string>; statusColumn?: number } = {},
) {
  const web = k.web;
  const rh = k.rowHeader ? 24 : 0;
  const sb = web ? 0 : 14;
  const hh = web ? 34 : 26;
  const rH = web ? 32 : 25;
  const n = rows.length;
  const gh = hh + n * rH;
  const pad = web ? 0 : 8;
  const rp = web ? 18 : 8;
  const ws = widths(cols, w - rh - sb - (web ? 24 : 0));
  const xs: number[] = [];
  let cx = x + rh + (web ? 12 : 0);
  for (const v of ws) {
    xs.push(cx);
    cx += v;
  }
  const ink = INK(k);
  const st = o.statusColors ?? {};
  const el = (
    <g>
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={gh} rx={web ? 10 : 0} fill="#fff" stroke={web ? k.gb : k.bd} />
      <rect x={x + 1} y={y + 1} width={w - 2} height={hh - 1} rx={web ? 9 : 0} fill={k.hdr} />
      <line x1={x} x2={x + w} y1={y + hh + 0.5} y2={y + hh + 0.5} stroke={web ? k.gb : k.id === 'wpf' ? '#d9d9d9' : k.bd} />
      {cols.map((c, j) => (
        <g key={`h${j}`}>
          {T(c.align ? xs[j]! + ws[j]! - rp : xs[j]! + pad, y + hh / 2 + 4, c.header, { fs: web ? 11 : 11.5, fw: web ? 700 : 600, a: c.align ? 'end' : 'start', c: web ? '#4b5563' : ink })}
          {!web && <line x1={xs[j]! + ws[j]! - 0.5} x2={xs[j]! + ws[j]! - 0.5} y1={y + 4} y2={k.id === 'wpf' ? y + hh - 4 : y + gh} stroke={k.grid} />}
        </g>
      ))}
      {rh > 0 && <line x1={x + rh + 0.5} x2={x + rh + 0.5} y1={y} y2={y + gh} stroke={k.grid} />}
      {rows.map((r, i) => {
        const ry = y + hh + i * rH;
        const on = i === o.sel;
        const white = on && k.selInk === '#ffffff';
        return (
          <Click key={i} onClick={o.onSel && (() => o.onSel!(i))}>
            <rect x={x + 1 + rh} y={ry + 0.5} width={w - rh - sb - 2} height={rH - 1} fill={on ? k.sel : k.alt && i % 2 ? k.alt : '#fff'} />
            {rh > 0 && (
              <g>
                <rect x={x + 1} y={ry + 0.5} width={rh - 1} height={rH - 1} fill={k.hdr} />
                {on && <path d={`M${x + 9} ${ry + 7} l6 5.5 l-6 5.5z`} fill="#333" />}
              </g>
            )}
            {i < n - 1 && <line x1={x + 1 + (web ? 12 : 0)} x2={x + w - sb - (web ? 12 : 0)} y1={ry + rH + 0.5} y2={ry + rH + 0.5} stroke={web ? '#f0f1f3' : k.grid} />}
            {r.map((v, j) => {
              const c = j === o.statusColumn ? st[v] : undefined;
              if (c && web) {
                const pw = tw(v, 10.5) + 18;
                return (
                  <g key={j}>
                    <rect x={xs[j]} y={ry + 7} width={pw} height={18} rx={9} fill={c} fillOpacity={0.13} />
                    {T(xs[j]! + pw / 2, ry + 20, v, { fs: 10.5, fw: 700, a: 'middle', c })}
                  </g>
                );
              }
              const right = cols[j]?.align === 'right';
              return (
                <g key={j}>
                  {c && !white && <circle cx={xs[j]! + 11} cy={ry + rH / 2} r={3.5} fill={c} />}
                  {T(right ? xs[j]! + ws[j]! - rp : xs[j]! + (c ? 19 : pad), ry + rH / 2 + 4, v, {
                    fs: 11.5,
                    fw: c ? 600 : 400,
                    a: right ? 'end' : 'start',
                    c: white ? '#fff' : (c ?? (web && j === 0 ? '#6b7280' : ink)),
                  })}
                </g>
              );
            })}
          </Click>
        );
      })}
      {sb > 0 && (
        <g>
          <rect x={x + w - sb} y={y + hh + 1} width={sb - 0.5} height={n * rH - 1} fill="#f0f0f0" />
          <rect x={x + w - sb + 3} y={y + hh + 5} width={sb - 6.5} height={n * rH * 0.45} rx={k.id === 'wpf' ? 3 : 0} fill={k.id === 'wpf' ? '#a8a8a8' : '#cdcdcd'} />
        </g>
      )}
    </g>
  );
  return { h: gh, hh, rH, el };
}

export type TreeNode = { text: string; level: number; expanded?: boolean; count: number };
export function Tree(k: Skin, x: number, y: number, w: number, h: number, nodes: TreeNode[], selected: number) {
  const rh = 24;
  return (
    <g>
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={k.web ? 10 : 0} fill={k.ctrl} stroke={k.web ? k.gb : k.bd} />
      {nodes.map((nd, i) => {
        const ry = y + 8 + i * rh;
        const ix = x + 10 + nd.level * 16;
        const on = i === selected;
        const white = on && k.selInk === '#ffffff';
        const folder = nd.expanded !== undefined;
        return (
          <g key={i}>
            {on && <rect x={ix + 14} y={ry} width={w - (ix - x) - 22} height={rh - 2} rx={k.web ? 6 : 0} fill={k.sel} />}
            {folder &&
              (k.bevel ? (
                <g>
                  <rect x={ix} y={ry + 6} width={9} height={9} fill="#fff" stroke="#919191" />
                  <line x1={ix + 2} x2={ix + 7} y1={ry + 10.5} y2={ry + 10.5} stroke="#333" />
                  {!nd.expanded && <line x1={ix + 4.5} x2={ix + 4.5} y1={ry + 8} y2={ry + 13} stroke="#333" />}
                </g>
              ) : (
                <path d={nd.expanded ? `M${ix} ${ry + 8} l4 4 l4 -4` : `M${ix + 2} ${ry + 6} l4 4 l-4 4`} stroke="#555" strokeWidth={1.4} fill="none" />
              ))}
            {folder ? <path d={`M${ix + 17} ${ry + 7} h5 l2 2 h7 v9 h-14z`} fill="#e8b13a" /> : <rect x={ix + 18} y={ry + 5} width={10} height={13} rx={1} fill="#fff" stroke="#8a8a8a" />}
            {T(ix + 36, ry + 15.5, nd.text, { fw: on ? 700 : 400, c: white ? '#fff' : INK(k) })}
            {T(x + w - 12, ry + 15.5, String(nd.count), { fs: 11, a: 'end', c: white ? '#fff' : MU(k) })}
          </g>
        );
      })}
    </g>
  );
}

export function Dialog(k: Skin, x: number, y: number, w: number, h: number, title: string) {
  if (k.web)
    return {
      bodyY: y + 56,
      el: (
        <g>
          <rect x={x} y={y} width={w} height={h} rx={14} fill="#fff" filter="url(#mk-dsh)" />
          {T(x + 20, y + 32, title, { fs: 15, fw: 700, c: '#111827' })}
          <path d={`M${x + w - 30} ${y + 22} l9 9 M${x + w - 21} ${y + 22} l-9 9`} stroke="#6b7280" strokeWidth={1.6} />
        </g>
      ),
    };
  return {
    bodyY: y + 42,
    el: (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={k.frame ? 6 : 0} fill={k.win} stroke="#8a8a8a" filter="url(#mk-dsh)" />
        <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={28} rx={k.frame ? 6 : 0} fill={k.title} />
        <line x1={x} x2={x + w} y1={y + 28.5} y2={y + 28.5} stroke="#e3e3e3" />
        {T(x + 12, y + 19, title)}
        <path d={`M${x + w - 22} ${y + 10} l8 8 M${x + w - 14} ${y + 10} l-8 8`} stroke="#333" />
      </g>
    ),
  };
}

export function Steps(k: Skin, x: number, y: number, w: number, steps: string[], act: number, onStep: (i: number) => void) {
  const n = steps.length;
  const sp = (w - 80) / (n - 1);
  const cy = y + 18;
  return (
    <g>
      {steps.slice(1).map((_, i) => (
        <line key={`l${i}`} x1={x + 40 + i * sp + 15} x2={x + 40 + (i + 1) * sp - 15} y1={cy} y2={cy} stroke={i < act ? k.accent : '#cfcfcf'} strokeWidth={2.5} />
      ))}
      {steps.map((s, i) => {
        const cx = x + 40 + i * sp;
        const done = i < act;
        const on = i === act;
        return (
          <Click key={i} onClick={() => onStep(i)}>
            <circle cx={cx} cy={cy} r={14} fill={done ? k.accent : '#fff'} stroke={done || on ? k.accent : '#c4c4c4'} strokeWidth={on ? 2.5 : 1.5} />
            {done ? <path d={`M${cx - 5} ${cy} l3.5 3.5 l6.5 -7`} stroke="#fff" strokeWidth={2.2} fill="none" /> : T(cx, cy + 4.5, String(i + 1), { fs: 12.5, fw: 700, a: 'middle', c: on ? k.accent : '#9a9a9a' })}
            {T(cx, cy + 34, s, { fs: 12, fw: on ? 700 : 400, a: 'middle', c: on ? INK(k) : MU(k) })}
          </Click>
        );
      })}
    </g>
  );
}

export type PinItem = { key: string; name: string; desc: string };
export function Pins({ list, pos }: { list: PinItem[]; pos: Pos }) {
  return (
    <g>
      {list.map((a, i) => {
        const r = pos[a.key]!;
        return (
          <g key={a.key}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="rgba(240,100,30,.05)" stroke="#f0641e" strokeDasharray="5 3" strokeWidth={1.2} />
            <circle cx={r.x + 2} cy={r.y + 2} r={10} fill="#f0641e" stroke="#fff" strokeWidth={2} />
            {T(r.x + 2, r.y + 6, String(i + 1), { fs: 11, fw: 700, a: 'middle', c: '#fff' })}
          </g>
        );
      })}
    </g>
  );
}
