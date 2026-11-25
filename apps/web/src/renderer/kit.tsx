import type { ReactNode } from 'react';
import type { Field, FrameworkId } from '@obp/shared';

// 예시 화면을 그리는 기본 도구: 스킨(색·모양)과 공통 컨트롤.
// 화면 유형별 배치는 layouts/, 창·브라우저 틀은 frame.tsx — docs/07_layouts.md

export type SkinId = 'wpf' | 'winform' | 'tk' | 'web';
export type Skin = {
  id: SkinId;
  web: boolean;
  win: string;
  title: string;
  ctrl: string;
  ro: string;
  bd: string;
  r: number;
  accent: string;
  hdr: string;
  sel: string;
  selInk: string;
  grid: string;
  alt: string | null;
  gb: string;
  gbFill: string;
  status: string;
  menuBg: string;
  btn: string;
  bbd: string;
  bevel: boolean;
  rowHeader: boolean;
  frame: number;
  ch: number;
  bh: number;
  card: string;
  cardBd: string;
  lane: string;
  tabBg: string;
  panel: string;
};

const WEB: Omit<Skin, 'accent' | 'sel'> = {
  id: 'web', web: true, win: '#f6f7f9', title: '#fff', ctrl: '#fff', ro: '#f3f4f6', bd: '#d1d5db', r: 6, hdr: '#f9fafb',
  selInk: '#111827', grid: '#eef0f3', alt: null, gb: '#e5e7eb', gbFill: '#fff', status: '#fff', menuBg: '#fff', btn: '#fff', bbd: '#d1d5db',
  bevel: false, rowHeader: false, frame: 10, ch: 30, bh: 32, card: '#fff', cardBd: '#e5e7eb', lane: '#eef0f3', tabBg: '#fff', panel: '#fff',
};

export const SKINS: Record<FrameworkId, Skin> = {
  wpf: {
    id: 'wpf', web: false, win: '#f9f9f9', title: '#ffffff', ctrl: '#ffffff', ro: '#f3f3f3', bd: '#c9c9c9', r: 4, accent: '#0067c0', hdr: '#f5f5f5',
    sel: '#cce4f7', selInk: '#1b1b1b', grid: '#ebebeb', alt: '#fbfbfb', gb: '#d6d6d6', gbFill: '#ffffff', status: '#f3f3f3', menuBg: '#ffffff',
    btn: '#fdfdfd', bbd: '#d0d0d0', bevel: false, rowHeader: false, frame: 8, ch: 24, bh: 28, card: '#ffffff', cardBd: '#dedede', lane: '#f0f0f0',
    tabBg: '#f3f3f3', panel: '#ffffff',
  },
  winform: {
    id: 'winform', web: false, win: '#f0f0f0', title: '#ffffff', ctrl: '#ffffff', ro: '#f0f0f0', bd: '#7a7a7a', r: 0, accent: '#0078d7', hdr: '#f0f0f0',
    sel: '#0078d7', selInk: '#ffffff', grid: '#d4d4d4', alt: null, gb: '#d5dfe5', gbFill: 'none', status: '#f0f0f0', menuBg: '#f5f6f7',
    btn: '#e1e1e1', bbd: '#adadad', bevel: true, rowHeader: true, frame: 0, ch: 24, bh: 28, card: '#ffffff', cardBd: '#a0a0a0', lane: '#e4e4e4',
    tabBg: '#f0f0f0', panel: '#ffffff',
  },
  python: {
    id: 'tk', web: false, win: '#dcdad5', title: '#ffffff', ctrl: '#ffffff', ro: '#eeedea', bd: '#9e9a91', r: 0, accent: '#4a6984', hdr: '#dcdad5',
    sel: '#4a6984', selInk: '#ffffff', grid: '#e6e4df', alt: null, gb: '#b5b2ab', gbFill: 'none', status: '#dcdad5', menuBg: '#f0efed',
    btn: '#dcdad5', bbd: '#9e9a91', bevel: true, rowHeader: false, frame: 0, ch: 24, bh: 28, card: '#efeee9', cardBd: '#b5b2ab', lane: '#cfcdc8',
    tabBg: '#cfcdc8', panel: '#dcdad5',
  },
  react: { ...WEB, accent: '#2450e6', sel: '#eaefff' },
  node: { ...WEB, accent: '#0f766e', sel: '#e1f3ef' },
};

export const INK = (k: Skin) => (k.web ? '#111827' : '#1b1b1b');
export const MU = (k: Skin) => (k.web ? '#6b7280' : '#5f5f5f');
/** 그룹 상자 제목 아래 내용이 시작하는 높이 */
export const GH = (k: Skin) => (k.web ? 40 : 22);
export const gap = (k: Skin) => (k.web ? 14 : 10);

/** 글자 폭 추정 (한글은 거의 정사각형) */
export const tw = (t: string, fs = 12) => {
  let w = 0;
  for (const c of t) w += /[ᄀ-퟿]/.test(c) ? fs * 0.98 : /[A-Z0-9@#%&]/.test(c) ? fs * 0.64 : fs * 0.54;
  return w;
};

export type Rect = { x: number; y: number; w: number; h: number };
export type Pos = Record<string, Rect>;

type TOpt = { fs?: number; fw?: number; c?: string; a?: 'start' | 'middle' | 'end'; del?: boolean };
export const T = (x: number, y: number, s: string, o: TOpt = {}) => (
  <text x={x} y={y} fontSize={o.fs ?? 12} fontWeight={o.fw ?? 400} fill={o.c ?? '#1b1b1b'} textAnchor={o.a ?? 'start'} textDecoration={o.del ? 'line-through' : 'none'}>
    {s}
  </text>
);
export const chev = (x: number, y: number, c = '#444') => <path d={`M${x - 4} ${y - 2} l4 4 l4 -4`} stroke={c} strokeWidth={1.3} fill="none" />;
export const widths = (cols: { width: number }[], avail: number) => {
  const t = cols.reduce((s, c) => s + c.width, 0);
  return cols.map((c) => (c.width / t) * avail);
};
export const Click = ({ onClick, children }: { onClick?: () => void; children: ReactNode }) => (
  <g onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
    {children}
  </g>
);

/** 여러 요소를 key와 함께 모으는 도우미 */
export function bag() {
  const els: ReactNode[] = [];
  return { els, add: (n: ReactNode) => els.push(<g key={els.length}>{n}</g>) };
}

/* ---------- 입력 컨트롤 ---------- */
type TBOpt = { ro?: boolean; ph?: string; icon?: boolean; h?: number };
export function TB(k: Skin, x: number, y: number, w: number, val: string | string[] | undefined, o: TBOpt = {}) {
  const H = o.h ?? k.ch;
  const lines = Array.isArray(val) ? val : null;
  const text = Array.isArray(val) ? '' : (val ?? '');
  const ph = !text && !lines && o.ph;
  return (
    <g>
      <rect x={x} y={y} width={w} height={H} rx={k.r} fill={o.ro ? k.ro : k.ctrl} stroke={k.bd} />
      {k.id === 'wpf' && !o.ro && <line x1={x + 2} x2={x + w - 2} y1={y + H - 0.5} y2={y + H - 0.5} stroke="#868686" />}
      {o.icon && (
        <g stroke="#8a8a8a" fill="none" strokeWidth={1.4}>
          <circle cx={x + 13} cy={y + H / 2 - 1} r={4.5} />
          <path d={`M${x + 16.5} ${y + H / 2 + 2.5} l3.5 3.5`} />
        </g>
      )}
      {lines
        ? lines.map((l, i) => <g key={i}>{T(x + 8, y + 16 + i * 16, l, { fs: 11.5, c: INK(k) })}</g>)
        : T(x + (o.icon ? 26 : 8), y + H / 2 + 4, text || o.ph || '', { fs: 11.5, c: ph ? '#9a9a9a' : o.ro ? '#666' : INK(k) })}
    </g>
  );
}
export function Combo(k: Skin, x: number, y: number, w: number, val?: string) {
  return (
    <g>
      {TB(k, x, y, w, val)}
      {k.bevel && <rect x={x + w - 18} y={y + 1} width={17} height={k.ch - 2} fill={k.id === 'tk' ? k.btn : '#e9e9e9'} stroke={k.id === 'tk' ? k.bbd : 'none'} />}
      {chev(x + w - 10, y + k.ch / 2, k.web ? '#6b7280' : '#444')}
    </g>
  );
}
export function Dt(k: Skin, x: number, y: number, w: number, val?: string) {
  const ix = x + w - 21;
  const cy = y + k.ch / 2;
  return (
    <g>
      {TB(k, x, y, w, val)}
      {k.id === 'winform' ? (
        <g>
          <rect x={x + w - 18} y={y + 1} width={17} height={k.ch - 2} fill="#e9e9e9" />
          {chev(x + w - 10, cy)}
        </g>
      ) : (
        <g stroke={k.web ? '#6b7280' : '#555'} fill="none">
          <rect x={ix} y={cy - 6} width={13} height={12} rx={1.5} />
          <line x1={ix} x2={ix + 13} y1={cy - 2.5} y2={cy - 2.5} />
        </g>
      )}
    </g>
  );
}
export function Num(k: Skin, x: number, y: number, w: number, val?: string) {
  const bx = x + w - 17;
  const cy = y + k.ch / 2;
  const fill = k.id === 'tk' ? k.btn : '#e9e9e9';
  const stroke = k.id === 'tk' ? k.bbd : '#c9c9c9';
  return (
    <g>
      {TB(k, x, y, w, val)}
      {k.bevel ? (
        <g>
          <rect x={bx} y={y + 1} width={16} height={k.ch / 2 - 1} fill={fill} stroke={stroke} />
          <rect x={bx} y={cy} width={16} height={k.ch / 2 - 1} fill={fill} stroke={stroke} />
        </g>
      ) : (
        <line x1={bx} x2={bx} y1={y + 4} y2={y + k.ch - 4} stroke="#e1e1e1" />
      )}
      <path d={`M${bx + 4.5} ${cy - 3} l3.5 -4 l3.5 4z M${bx + 4.5} ${cy + 3} l3.5 4 l3.5 -4z`} fill="#555" />
    </g>
  );
}
export type BtnKind = '' | 'primary' | 'danger';
export function Btn(k: Skin, x: number, y: number, w: number, label: string, kind: BtnKind = '', o: { dis?: boolean } = {}) {
  const h = k.bh;
  const op = o.dis ? 0.45 : 1;
  const p = kind === 'primary';
  if (k.web) {
    const dg = kind === 'danger';
    return (
      <g opacity={op}>
        <rect x={x} y={y} width={w} height={h} rx={7} fill={p ? k.accent : '#fff'} stroke={p ? k.accent : dg ? '#fca5a5' : '#d1d5db'} />
        {T(x + w / 2, y + h / 2 + 4.5, label, { fs: 12.5, fw: 600, a: 'middle', c: p ? '#fff' : dg ? '#dc2626' : '#374151' })}
      </g>
    );
  }
  if (k.bevel)
    return (
      <g opacity={op}>
        <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} fill={k.btn} stroke={p ? k.accent : k.bbd} strokeWidth={p ? 1.6 : 1} />
        <polyline points={`${x + 2},${y + h - 3} ${x + 2},${y + 2} ${x + w - 3},${y + 2}`} stroke="#ffffff" fill="none" />
        <polyline points={`${x + 2},${y + h - 2} ${x + w - 2},${y + h - 2} ${x + w - 2},${y + 2}`} stroke="#a0a0a0" fill="none" />
        {T(x + w / 2, y + 18, label, { a: 'middle' })}
      </g>
    );
  return (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={p ? k.accent : '#fdfdfd'} stroke={p ? '#005aa9' : '#d0d0d0'} />
      <line x1={x + 3} x2={x + w - 3} y1={y + h - 0.5} y2={y + h - 0.5} stroke={p ? '#003e7a' : '#b0b0b0'} />
      {T(x + w / 2, y + 18, label, { fw: 600, a: 'middle', c: p ? '#fff' : kind === 'danger' ? '#c42b1c' : '#1b1b1b' })}
    </g>
  );
}
const offStroke = (k: Skin) => (k.web ? '#9ca3af' : k.id === 'tk' ? '#9e9a91' : '#333');
export function Check(k: Skin, x: number, y: number, label: string, on: boolean) {
  const cy = y + k.ch / 2;
  const acc = k.web || k.id === 'wpf';
  return {
    w: 22 + tw(label) + 16,
    el: (
      <g>
        <rect x={x} y={cy - 7} width={14} height={14} rx={k.web ? 3.5 : k.id === 'wpf' ? 2.5 : 0} fill={on && acc ? k.accent : '#fff'} stroke={on && acc ? k.accent : offStroke(k)} />
        {on && <path d={`M${x + 3} ${cy} l3 3 l5 -6`} stroke={acc ? '#fff' : '#1b1b1b'} strokeWidth={1.8} fill="none" />}
        {label && T(x + 21, cy + 4, label, { c: INK(k) })}
      </g>
    ),
  };
}
export function Radio(k: Skin, x: number, y: number, label: string, on: boolean) {
  const cy = y + k.ch / 2;
  const acc = k.web || k.id === 'wpf';
  return {
    w: 22 + tw(label) + 16,
    el: (
      <g>
        <circle cx={x + 7} cy={cy} r={7} fill="#fff" stroke={on && acc ? k.accent : offStroke(k)} strokeWidth={on && acc ? 1.6 : 1} />
        {on && <circle cx={x + 7} cy={cy} r={3.6} fill={acc ? k.accent : '#1b1b1b'} />}
        {T(x + 21, cy + 4, label, { c: INK(k) })}
      </g>
    ),
  };
}
export function Slider(k: Skin, x: number, y: number, w: number, pct: number, val: string) {
  const cy = y + k.ch / 2;
  const tx = x + w * pct;
  const thumb =
    k.id === 'winform' ? (
      <path d={`M${tx - 5} ${cy - 9} h10 v12 l-5 6 l-5 -6z`} fill="#0078d7" />
    ) : k.id === 'tk' ? (
      <rect x={tx - 6} y={cy - 9} width={12} height={18} fill={k.btn} stroke={k.bbd} />
    ) : (
      <circle cx={tx} cy={cy} r={8} fill="#fff" stroke={k.accent} strokeWidth={2.5} />
    );
  return (
    <g>
      <rect x={x} y={cy - 2} width={w} height={4} rx={2} fill={k.web ? '#e5e7eb' : '#cfcfcf'} />
      <rect x={x} y={cy - 2} width={w * pct} height={4} rx={2} fill={k.id === 'tk' ? '#8a8a8a' : k.accent} />
      {k.id === 'winform' && Array.from({ length: 11 }, (_, i) => <line key={i} x1={x + (w * i) / 10} x2={x + (w * i) / 10} y1={cy + 11} y2={cy + 14} stroke="#888" />)}
      {thumb}
      {T(x + w + 12, cy + 4, val, { fw: 600, c: INK(k) })}
    </g>
  );
}
export function Progress(k: Skin, x: number, y: number, w: number, pct: number, col?: string) {
  const h = k.web ? 8 : 12;
  const inset = k.web ? 0 : 1;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={k.web ? 4 : 0} fill={k.web ? '#e5e7eb' : '#e6e6e6'} stroke={k.web ? 'none' : '#bcbcbc'} />
      <rect x={x + inset} y={y + inset} width={Math.max(0, (w - 2 * inset) * pct)} height={h - 2 * inset} rx={k.web ? 4 : 0} fill={col ?? (k.id === 'winform' ? '#06b025' : k.accent)} />
    </g>
  );
}
export function Group(k: Skin, x: number, y: number, w: number, h: number, label: string) {
  if (k.web)
    return (
      <g>
        <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={10} fill="#fff" stroke={k.gb} />
        {T(x + 16, y + 26, label, { fs: 13.5, fw: 700, c: '#111827' })}
      </g>
    );
  return (
    <g>
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={k.r} fill={k.gbFill} stroke={k.gb} />
      {k.id === 'winform' && <rect x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} fill="none" stroke="#ffffff" />}
      <rect x={x + 8} y={y - 8} width={tw(label) + 12} height={16} fill={k.win} />
      {T(x + 14, y + 4, label, { fw: k.id === 'wpf' ? 600 : 400 })}
    </g>
  );
}
export function Card(k: Skin, x: number, y: number, w: number, h: number, o: { fill?: string; stroke?: string; sw?: number } = {}) {
  return <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={k.web ? 10 : k.id === 'wpf' ? 6 : 0} fill={o.fill ?? k.card} stroke={o.stroke ?? k.cardBd} strokeWidth={o.sw ?? 1} />;
}
/** 선택 기능 표시 배지 (오른쪽 끝 x 기준) */
export const OptBadge = (x: number, y: number) => (
  <g>
    <rect x={x - 46} y={y} width={46} height={18} rx={9} fill="#fff4e6" />
    {T(x - 23, y + 13, '선택', { fs: 10.5, fw: 700, a: 'middle', c: '#d9480f' })}
  </g>
);

/* ---------- 입력 항목 한 줄 (라벨 + 컨트롤) ---------- */
export function FieldRow(k: Skin, x: number, y: number, w: number, f: Field, lw: number, pos: Pos | null) {
  const cx = x + lw;
  const cw = w - lw;
  const { els, add } = bag();
  let h = k.ch;
  let rw = cw;
  let key: string | null = f.type;
  const val = typeof f.value === 'string' ? f.value : undefined;
  add(
    <text x={x} y={y + k.ch / 2 + 4} fontSize={12} fill={INK(k)}>
      {f.label}
      {f.required && <tspan fill="#d92d20"> *</tspan>}
    </text>,
  );
  switch (f.type) {
    case 'text':
      add(TB(k, cx, y, cw, val, { ph: f.placeholder }));
      break;
    case 'ro':
      add(TB(k, cx, y, cw, val, { ro: true }));
      key = null;
      break;
    case 'multi':
      h = 54;
      add(TB(k, cx, y, cw, f.value, { h }));
      key = 'text';
      break;
    case 'combo':
      rw = Math.min(cw, 220);
      add(Combo(k, cx, y, rw, val));
      break;
    case 'date':
      rw = Math.min(cw, 150);
      add(Dt(k, cx, y, rw, val === '-' ? '' : val));
      break;
    case 'num': {
      const nw = Math.min(cw, 96);
      add(Num(k, cx, y, nw, val));
      if (f.unit) add(T(cx + nw + 8, y + k.ch / 2 + 4, f.unit, { c: INK(k) }));
      rw = nw + (f.unit ? 30 : 0);
      break;
    }
    case 'radio':
    case 'check': {
      let ox = cx;
      (f.options ?? []).forEach((o, i) => {
        const on = f.type === 'radio' ? i === f.selected : Array.isArray(f.selected) && f.selected.includes(i);
        const r = (f.type === 'radio' ? Radio : Check)(k, ox, y, o, on);
        add(r.el);
        ox += r.w;
      });
      rw = ox - cx - 10;
      break;
    }
    case 'slider':
      rw = Math.min(cw - 70, 200);
      add(Slider(k, cx + 8, y, rw, f.percent ?? 0.5, val ?? ''));
      rw += 70;
      break;
  }
  if (key && pos && !pos[key]) pos[key] = { x: cx - 4, y: y - 3, w: rw + 8, h: h + 6 };
  return { h, el: <g>{els}</g> };
}

/** 미리보기용 값 문자열 */
export function fieldText(f: Field): string {
  if (f.type === 'radio') return f.options?.[f.selected as number] ?? '—';
  if (f.type === 'check') {
    const sel = Array.isArray(f.selected) ? f.selected : [];
    return sel.length ? (f.options ?? []).filter((_, i) => sel.includes(i)).join(', ') : '선택 안 함';
  }
  if (Array.isArray(f.value)) return f.value.join(' ');
  if (f.type === 'num') return `${f.value ?? ''}${f.unit ?? ''}`;
  return f.value || '—';
}
