import type { Field, MockupDataMap } from '@obp/shared';
import { Btn, Card, Click, Combo, Dt, FieldRow, GH, Group, INK, MU, OptBadge, Progress, T, TB, bag, clip, niceTop, tw, type Pos, type Skin } from '../kit';
import { Dialog, Grid, List, Tabs, Tree } from '../widgets';
import type { LayoutFn } from './types';

// 중급 화면 유형 6종 — 구성은 docs/07_layouts.md#중급
// 업무 내용(문구·열 이름)은 모두 데이터에서 가져오고, 여기에는 화면 구조만 둡니다.

type Table = MockupDataMap['gridForm'];
type FormSpec = Table['form'][number];
const toField = (f: FormSpec, value: string | undefined): Field => ({ label: f.label, type: f.type, value, required: f.required });
const dateColumn = (d: Pick<Table, 'form'>) => d.form.find((f) => f.type === 'date')?.column;
const NEW = '+ 새로 등록';

function SearchRow(k: Skin, x: number, y: number, s: NonNullable<Table['search']>, pos: Pos) {
  const { els, add } = bag();
  let cx = x;
  const label = (t: string) => {
    add(T(cx, y + k.ch / 2 + 4, t, { c: INK(k) }));
    cx += tw(t) + 10;
  };
  label(s.combo);
  add(Combo(k, cx, y, 100, '전체'));
  pos.combo = { x: cx - 4, y: y - 3, w: 108, h: k.ch + 6 };
  cx += 118;
  label(s.text);
  add(TB(k, cx, y, 124, ''));
  cx += 142;
  label(s.range);
  const dw = 104;
  add(Dt(k, cx, y, dw, s.rangeValue[0]));
  add(T(cx + dw + 6, y + k.ch / 2 + 4, '~'));
  add(Dt(k, cx + dw + 20, y, dw, s.rangeValue[1]));
  pos.date = { x: cx - 4, y: y - 3, w: dw * 2 + 28, h: k.ch + 6 };
  return <g>{els}</g>;
}

export const gridForm: LayoutFn<'gridForm'> = ({ k, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const row = d.rows[sel] ?? d.rows[0]!;
  const gh = GH(k);
  const sh = gh + k.ch + 14;
  add(Group(k, b.x, b.y, b.w, sh, '검색 조건'));
  pos.search = { x: b.x, y: b.y, w: b.w, h: sh };
  const cy = b.y + gh - 2;
  add(SearchRow(k, b.x + 16, cy, d.search, pos));
  add(Btn(k, b.x + b.w - 16 - 72, cy + (k.ch - k.bh) / 2, 72, '조회', 'primary'));
  let y = b.y + sh + 12;
  const g = Grid(k, b.x, y, b.w, d.columns, d.rows, { sel, onSel: setSel, statusColors: d.statusColors, statusColumn: d.statusColumn });
  add(g.el);
  pos.grid = { x: b.x, y, w: b.w, h: g.h };
  y += g.h + 6;
  const pb = b.x + b.w - 6 * 26;
  add(T(b.x + 2, y + 15, `총 ${d.total}건 · 페이지당 20건`, { fs: 11.5, c: MU(k) }));
  add(OptBadge(pb - 8, y + 2));
  ['‹', '1', '2', '3', '4', '›'].forEach((t, i) =>
    add(
      <g>
        <rect x={pb + i * 26} y={y} width={22} height={22} rx={k.web ? 6 : k.r} fill={t === '1' ? k.accent : '#fff'} stroke={t === '1' ? k.accent : k.bd} />
        {T(pb + i * 26 + 11, y + 15, t, { fs: 11.5, a: 'middle', c: t === '1' ? '#fff' : INK(k) })}
      </g>,
    ),
  );
  y += 22 + 18;
  const fh = gh + 2 * (k.ch + 12) + 8;
  const colW = (b.w - 28) / 3;
  add(Group(k, b.x, y, b.w, fh, '상세 정보'));
  pos.form = { x: b.x, y, w: b.w, h: fh };
  d.form.slice(0, 6).forEach((f, j) => {
    const r = Math.floor(j / 3);
    const c = j % 3;
    add(FieldRow(k, b.x + 14 + c * colW, y + gh + r * (k.ch + 12), colW - 14, toField(f, row[f.column]), 72, null).el);
  });
  y += fh + 14;
  const bw = 78;
  const bx = b.x + b.w - 4 * bw - 24;
  (
    [
      ['신규', ''],
      ['등록', 'primary'],
      ['수정', ''],
      ['삭제', 'danger'],
    ] as const
  ).forEach(([l, kd], i) => add(Btn(k, bx + i * (bw + 8), y, bw, l, kd)));
  add(Btn(k, b.x, y, 112, '엑셀 내보내기'));
  add(OptBadge(b.x + 162, y + 5));
  pos.buttons = { x: bx, y, w: 4 * bw + 24, h: k.bh };
  return { els, pos, h: y + k.bh - b.y, status: `총 ${d.total}건 | 선택: ${row[0]} ${row[1]}` };
};

export const masterDetail: LayoutFn<'masterDetail'> = ({ k, a, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const LW = 250;
  const row = d.rows[sel] ?? d.rows[0]!;
  add(TB(k, b.x, b.y, LW, '', { ph: '목록 검색', icon: true }));
  pos.text = { x: b.x - 4, y: b.y - 3, w: LW + 8, h: k.ch + 6 };
  const ly = b.y + k.ch + 10;
  const l = List(
    k,
    b.x,
    ly,
    LW,
    d.rows.map((r) => ({ t: r[d.nameColumn]!, s: `${r[0]} · ${r[d.subColumn]}`, dot: d.statusColors[r[d.statusColumn]!] })),
    { rh: 44, two: true, sel, onSel: setSel },
  );
  add(l.el);
  pos.list = { x: b.x, y: ly, w: LW, h: l.h };
  const sx = b.x + LW + 5;
  add(
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={sx + 4} cy={ly + l.h / 2 - 8 + i * 8} r={1.6} fill="#9a9a9a" />
      ))}
    </g>,
  );
  pos.split = { x: sx - 2, y: ly, w: 12, h: l.h };

  const px = b.x + LW + 18;
  const pw = b.w - LW - 18;
  const name = row[d.nameColumn]!;
  const st = row[d.statusColumn]!;
  const sc = d.statusColors[st];
  add(T(px, b.y + 16, name, { fs: 17, fw: 800, c: INK(k) }));
  const nx = px + tw(name, 17) + 12;
  add(
    <g>
      <rect x={nx} y={b.y + 3} width={tw(st, 11) + 16} height={18} rx={9} fill={sc} fillOpacity={0.14} />
      {T(nx + 8, b.y + 16, st, { fs: 11, fw: 700, c: sc })}
    </g>,
  );
  add(T(px, b.y + 34, `${row[0]} · ${a.team}`, { fs: 11.5, c: MU(k) }));
  const ty = b.y + 46;
  const colW = (pw - 40) / 2;
  const fr = Math.ceil(d.form.length / 2);
  const histH = 26 + d.history.rows.length * 25 + (k.web ? 16 : 0);
  const th = (k.web ? 40 : 26) + (k.web ? 18 : 16) + fr * (k.ch + 10) + 16 + histH + 16;
  const t = Tabs(k, px, ty, pw, th, d.tabs, 0);
  add(t.el);
  pos.tabs = { x: px, y: ty, w: t.headWidth, h: t.th };
  let fy = t.top;
  d.form.forEach((f, j) => {
    const r = Math.floor(j / 2);
    const c = j % 2;
    add(FieldRow(k, px + 16 + c * (colW + 8), fy + r * (k.ch + 10), colW, toField(f, row[f.column]), 74, null).el);
  });
  pos.form = { x: px + 10, y: fy - 6, w: pw - 20, h: fr * (k.ch + 10) + 4 };
  fy += fr * (k.ch + 10) + 6;
  add(T(px + 16, fy + 4, d.history.title, { fw: 700, c: INK(k) }));
  const g = Grid(k, px + 16, fy + 12, pw - 32, d.history.columns, d.history.rows);
  add(g.el);
  pos.mini = { x: px + 16, y: fy + 12, w: pw - 32, h: g.h };
  const by = ty + th + 12;
  const bw = 78;
  (
    [
      ['신규', ''],
      ['저장', 'primary'],
      ['삭제', 'danger'],
    ] as const
  ).forEach(([lb, kd], i) => add(Btn(k, px + pw - 3 * bw - 16 + i * (bw + 8), by, bw, lb, kd)));
  pos.buttons = { x: px + pw - 3 * bw - 16, y: by, w: 3 * bw + 16, h: k.bh };
  return { els, pos, h: Math.max(ly + l.h, by + k.bh) - b.y, status: `목록 ${d.rows.length}건 · 선택: ${name}` };
};

export const kanban: LayoutFn<'kanban'> = ({ k, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const bo = (k.ch - k.bh) / 2;
  add(TB(k, b.x, b.y, 200, '', { ph: '검색', icon: true }));
  pos.text = { x: b.x - 4, y: b.y - 3, w: 208, h: k.ch + 6 };
  add(Combo(k, b.x + 212, b.y, 140, `${d.columns[d.ownerColumn]!.header}: 전체`));
  pos.combo = { x: b.x + 208, y: b.y - 3, w: 148, h: k.ch + 6 };
  add(Btn(k, b.x + b.w - 118, b.y + bo, 118, NEW, 'primary'));
  pos.addBtn = { x: b.x + b.w - 118, y: b.y + bo, w: 118, h: k.bh };

  const by = b.y + k.ch + 14;
  const DW = 212;
  const BW = b.w - DW - 14;
  const nl = d.lanes.length;
  const cw = (BW - (nl - 1) * 10) / nl;
  const CH = 68;
  const lanes = d.lanes.map((ln) => d.rows.map((r, i) => [r, i] as const).filter(([r]) => r[d.statusColumn] === ln));
  const most = Math.max(...lanes.map((l) => l.length));
  const fields = d.form.filter((f) => f.type !== 'ro');
  const detailH = GH(k) + fields.length * (k.web ? 54 : 46) + 2 * k.bh + 30;
  const LH = Math.max(44 + most * (CH + 8) + 54, detailH);
  lanes.forEach((cards, li) => {
    const lx = b.x + li * (cw + 10);
    const col = d.statusColors[d.lanes[li]!];
    add(<rect x={lx} y={by} width={cw} height={LH} rx={k.web ? 12 : k.id === 'wpf' ? 6 : 0} fill={k.lane} />);
    add(
      <g>
        <circle cx={lx + 16} cy={by + 20} r={5} fill={col} />
        {T(lx + 28, by + 24.5, d.lanes[li]!, { fw: 700, c: INK(k) })}
        <rect x={lx + cw - 34} y={by + 11} width={24} height={18} rx={9} fill="#fff" />
        {T(lx + cw - 22, by + 24, String(cards.length), { fs: 11, fw: 700, a: 'middle', c: MU(k) })}
      </g>,
    );
    if (li === 0) pos.lane = { x: lx, y: by, w: cw, h: LH };
    cards.forEach(([r, ri], ci) => {
      const cy = by + 40 + ci * (CH + 8);
      const cx = lx + 8;
      const w = cw - 16;
      const on = ri === sel;
      const type = r[d.typeColumn]!;
      add(
        <Click onClick={() => setSel(ri)}>
          {Card(k, cx, cy, w, CH, { fill: '#fff', stroke: on ? k.accent : k.cardBd, sw: on ? 2 : 1 })}
          {T(cx + 10, cy + 17, r[0]!, { fs: 10.5, c: MU(k) })}
          {T(cx + 10, cy + 36, clip(r[d.titleColumn]!, 12, w - 20, true), { fs: 12, fw: 700, c: INK(k) })}
          <rect x={cx + 10} y={cy + 45} width={tw(type, 10.5) + 14} height={16} rx={k.web ? 8 : 2} fill="#f1f3f5" />
          {T(cx + 17, cy + 57, type, { fs: 10.5, c: '#495057' })}
          <circle cx={cx + w - 16} cy={cy + 53} r={9} fill={col} fillOpacity={0.18} />
          {T(cx + w - 16, cy + 57, r[d.ownerColumn]!.slice(0, 1), { fs: 10, fw: 700, a: 'middle', c: col })}
        </Click>,
      );
      if (li === 0 && ci === 0) pos.card = { x: cx, y: cy, w, h: CH };
    });
    if (li === 1) {
      const py = by + 40 + cards.length * (CH + 8);
      add(
        <g>
          <rect x={lx + 8} y={py} width={cw - 16} height={40} rx={k.web ? 8 : 0} fill="none" stroke={k.accent} strokeDasharray="5 4" />
          {T(lx + cw / 2, py + 24, tw('끌어 놓기 (선택 기능)', 11.5) > cw - 28 ? '끌어 놓기 (선택)' : '끌어 놓기 (선택 기능)', { fs: 11.5, a: 'middle', c: k.accent })}
        </g>,
      );
    }
  });
  const row = d.rows[sel] ?? d.rows[0]!;
  const dx = b.x + BW + 14;
  add(Group(k, dx, by, DW, LH, '선택 항목'));
  pos.detail = { x: dx, y: by, w: DW, h: LH };
  let fy = by + GH(k);
  for (const f of fields) {
    const v = row[f.column];
    add(T(dx + 14, fy + 10, f.label, { fs: 11, c: MU(k) }));
    add(f.type === 'combo' ? Combo(k, dx + 14, fy + 16, DW - 28, v) : f.type === 'date' ? Dt(k, dx + 14, fy + 16, DW - 28, v) : TB(k, dx + 14, fy + 16, DW - 28, v));
    fy += k.web ? 54 : 46;
  }
  const bw = (DW - 36) / 2;
  const last = d.lanes.indexOf(row[d.statusColumn]!) === d.lanes.length - 1;
  const my = by + LH - 2 * k.bh - 22;
  add(Btn(k, dx + 14, my, DW - 28, last ? '마지막 단계' : d.moveLabel, 'primary', { dis: last }));
  pos.move = { x: dx + 14, y: my, w: DW - 28, h: k.bh };
  add(Btn(k, dx + 14, by + LH - k.bh - 14, bw, '수정'));
  add(Btn(k, dx + 22 + bw, by + LH - k.bh - 14, bw, '삭제', 'danger'));
  return { els, pos, h: by + LH - b.y, status: d.lanes.map((l, i) => `${l} ${lanes[i]!.length}`).join(' · ') };
};

/** 가장 이른 날짜가 속한 주의 월요일 기준으로 요일 머리글을 만듭니다. */
function weekHeader(dates: string[]) {
  const first = [...dates].filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)).sort()[0];
  if (!first) return { title: '이번 주', days: ['월', '화', '수', '목', '금'] };
  const [y, m, dd] = first.split('-').map(Number) as [number, number, number];
  const base = new Date(y, m - 1, dd);
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  const days = ['월', '화', '수', '목', '금'].map((w, i) => {
    const t = new Date(base);
    t.setDate(base.getDate() + i);
    return { w, t };
  });
  const s = days[0]!.t;
  const e = days[4]!.t;
  return { title: `${s.getFullYear()}년 ${s.getMonth() + 1}월 ${s.getDate()}일 – ${e.getMonth() === s.getMonth() ? '' : `${e.getMonth() + 1}월 `}${e.getDate()}일`, days: days.map(({ w, t }) => `${w} ${t.getDate()}`) };
}

export const calendar: LayoutFn<'calendar'> = ({ k, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const bo = (k.ch - k.bh) / 2;
  const dc = dateColumn(d);
  const week = weekHeader(dc === undefined ? [] : d.rows.map((r) => r[dc]!));
  add(Btn(k, b.x, b.y, 34, '‹'));
  add(Btn(k, b.x + 40, b.y, 34, '›'));
  add(Btn(k, b.x + 80, b.y, 56, '오늘'));
  pos.nav = { x: b.x, y: b.y, w: 136, h: k.bh };
  add(T(b.x + 150, b.y + k.bh / 2 + 5, week.title, { fs: 14.5, fw: 800, c: INK(k) }));
  const filter = d.form.find((f) => f.type === 'combo');
  add(Combo(k, b.x + b.w - 118 - 12 - 140, b.y - bo, 140, `전체 ${filter?.label ?? ''}`.trim()));
  pos.combo = { x: b.x + b.w - 274, y: b.y - bo - 3, w: 148, h: k.ch + 6 };
  add(Btn(k, b.x + b.w - 118, b.y, 118, NEW, 'primary'));
  pos.addBtn = { x: b.x + b.w - 118, y: b.y, w: 118, h: k.bh };

  const gy = b.y + k.bh + 12;
  const TW = 54;
  const dw = (b.w - TW) / 5;
  const HH = 40;
  const RH = 34;
  const hours = 9;
  const gh = HH + hours * RH;
  const today = 1;
  const line = k.web ? '#eef0f3' : k.grid;
  add(
    <g>
      <rect x={b.x + 0.5} y={gy + 0.5} width={b.w - 1} height={gh} rx={k.web ? 10 : 0} fill="#fff" stroke={k.web ? k.gb : k.bd} />
      <rect x={b.x + 1} y={gy + 1} width={b.w - 2} height={HH - 1} rx={k.web ? 9 : 0} fill={k.hdr} />
      {week.days.map((t, i) => (
        <g key={`d${i}`}>
          {i === today && <rect x={b.x + TW + i * dw + 1} y={gy + HH} width={dw - 1} height={hours * RH} fill={k.accent} fillOpacity={0.04} />}
          {T(b.x + TW + i * dw + dw / 2, gy + 25, t, { fs: 12.5, fw: 700, a: 'middle', c: i === today ? k.accent : INK(k) })}
          <line x1={b.x + TW + i * dw + 0.5} x2={b.x + TW + i * dw + 0.5} y1={gy} y2={gy + gh} stroke={line} />
        </g>
      ))}
      {Array.from({ length: hours }, (_, i) => (
        <g key={`h${i}`}>
          <line x1={b.x} x2={b.x + b.w} y1={gy + HH + i * RH + 0.5} y2={gy + HH + i * RH + 0.5} stroke={line} />
          <line x1={b.x + TW} x2={b.x + b.w} y1={gy + HH + i * RH + RH / 2 + 0.5} y2={gy + HH + i * RH + RH / 2 + 0.5} stroke={k.web ? '#f6f7f9' : '#f1f1f1'} strokeDasharray="3 3" />
          {T(b.x + TW - 8, gy + HH + i * RH + 13, `${9 + i}:00`, { fs: 10.5, a: 'end', c: MU(k) })}
        </g>
      ))}
    </g>,
  );
  pos.cal = { x: b.x, y: gy, w: b.w, h: gh };
  const titleCol = d.form.find((f) => f.type === 'text')?.column ?? 1;
  const subCol = filter?.column ?? 0;
  d.rows.forEach((r, i) => {
    const [st, en] = d.times[i]!;
    const ex = b.x + TW + d.days[i]! * dw + 3;
    const ey = gy + HH + (st - 9) * RH + 1;
    const eh = (en - st) * RH - 2;
    const c = d.statusColors[r[d.statusColumn]!];
    const on = i === sel;
    add(
      <Click onClick={() => setSel(i)}>
        <rect x={ex} y={ey} width={dw - 6} height={eh} rx={k.web ? 6 : k.id === 'wpf' ? 3 : 0} fill={c} fillOpacity={on ? 0.26 : 0.13} stroke={c} strokeWidth={on ? 2 : 0} />
        <rect x={ex} y={ey} width={3} height={eh} fill={c} />
        {T(ex + 9, ey + 15, r[titleCol]!, { fs: 11, fw: 700, c: INK(k) })}
        {eh > 34 && T(ex + 9, ey + 29, r[subCol]!, { fs: 10.5, c: MU(k) })}
      </Click>,
    );
    if (on) pos.event = { x: ex, y: ey, w: dw - 6, h: eh };
  });
  const row = d.rows[sel] ?? d.rows[0]!;
  const [st, en] = d.times[sel] ?? d.times[0]!;
  const fm = (t: number) => `${Math.floor(t)}:${t % 1 ? '30' : '00'}`;
  const dialogFields: Field[] = [...d.form.filter((f) => f.type !== 'ro').slice(0, 4).map((f) => toField(f, row[f.column])), { label: '시간', type: 'text', value: `${fm(st)} ~ ${fm(en)}` }];
  const DW2 = 316;
  const DH = (k.web ? 56 : 42) + dialogFields.length * (k.ch + 10) + k.bh + 22;
  const dx = b.x + b.w - DW2 - 18;
  const dy = gy + HH + 18;
  if (k.web) add(<rect x={b.x} y={gy} width={b.w} height={gh} rx={10} fill="#111827" fillOpacity={0.28} />);
  const dl = Dialog(k, dx, dy, DW2, DH, '일정 수정');
  add(dl.el);
  dialogFields.forEach((f, i) => add(FieldRow(k, dx + 18, dl.bodyY + i * (k.ch + 10), DW2 - 36, f, 60, null).el));
  const bby = dy + DH - k.bh - 14;
  add(Btn(k, dx + 18, bby, 68, '삭제', 'danger'));
  add(Btn(k, dx + DW2 - 18 - 2 * 72 - 8, bby, 72, '취소'));
  add(Btn(k, dx + DW2 - 18 - 72, bby, 72, '저장', 'primary'));
  pos.dialog = { x: dx, y: dy, w: DW2, h: DH };
  return { els, pos, h: gy + gh - b.y, status: `이번 주 ${d.rows.length}건 · 선택: ${row[0]}` };
};

export const dashboard: LayoutFn<'dashboard'> = ({ k, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const bo = (k.ch - k.bh) / 2;
  const dc = dateColumn(d);
  const dates = dc === undefined ? [] : d.rows.map((r) => r[dc]!).sort();
  const range = d.search?.rangeValue ?? [dates[0] ?? '', dates.at(-1) ?? ''];
  add(T(b.x, b.y + k.ch / 2 + 4, '조회 기간', { c: INK(k) }));
  add(Dt(k, b.x + 62, b.y, 112, range[0]));
  add(T(b.x + 180, b.y + k.ch / 2 + 4, '~'));
  add(Dt(k, b.x + 194, b.y, 112, range[1]));
  pos.date = { x: b.x + 58, y: b.y - 3, w: 252, h: k.ch + 6 };
  add(Combo(k, b.x + 318, b.y, 120, '전체'));
  add(Btn(k, b.x + 446, b.y + bo, 64, '조회', 'primary'));
  add(Btn(k, b.x + b.w - 124, b.y + bo, 124, NEW));
  pos.addBtn = { x: b.x + b.w - 124, y: b.y + bo, w: 124, h: k.bh };

  let y = b.y + k.ch + 14;
  const cw = (b.w - 36) / 4;
  d.kpis.forEach((c, i) => {
    const cx = b.x + i * (cw + 12);
    add(Card(k, cx, y, cw, 84));
    add(T(cx + 16, y + 24, c.label, { fs: 12, c: MU(k) }));
    add(T(cx + 16, y + 56, c.value, { fs: 25, fw: 800, c: INK(k) }));
    add(T(cx + 16, y + 74, `${c.delta} 전월 대비`, { fs: 11, fw: 600, c: c.good ? '#2b8a3e' : '#e03131' }));
  });
  pos.cards = { x: b.x, y, w: b.w, h: 84 };

  y += 84 + 12;
  const c1 = Math.round(b.w * 0.6);
  const CH = 196;
  const [sa, sb] = d.ratio;
  const colA = sa?.[2] ?? '#1c7ed6';
  const colB = sb?.[2] ?? '#f08c00';
  add(Card(k, b.x, y, c1, CH));
  add(T(b.x + 16, y + 26, '기간별 추이', { fs: 13, fw: 700, c: INK(k) }));
  add(OptBadge(b.x + c1 - 142, y + 14));
  add(
    <g>
      <rect x={b.x + c1 - 130} y={y + 17} width={10} height={10} fill={colA} />
      {T(b.x + c1 - 116, y + 26, sa?.[0] ?? 'A', { fs: 11, c: MU(k) })}
      <rect x={b.x + c1 - 76} y={y + 17} width={10} height={10} fill={colB} />
      {T(b.x + c1 - 62, y + 26, sb?.[0] ?? 'B', { fs: 11, c: MU(k) })}
    </g>,
  );
  const px = b.x + 46;
  const py = y + 44;
  const ph = 118;
  const pw = c1 - 66;
  const n = d.chart.labels.length;
  const gw = pw / n;
  const top = niceTop(Math.max(...d.chart.a, ...d.chart.b));
  [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
    const yy = py + ph - f * ph;
    add(<line x1={px} x2={px + pw} y1={yy} y2={yy} stroke={k.web ? '#f0f1f3' : '#ececec'} />);
    add(T(px - 8, yy + 4, String(Math.round(top * f)), { fs: 10, a: 'end', c: MU(k) }));
  });
  d.chart.labels.forEach((t, i) => {
    const gx = px + i * gw + gw / 2;
    const bw = gw * 0.26;
    const ha = (d.chart.a[i]! / top) * ph;
    const hb = (d.chart.b[i]! / top) * ph;
    add(
      <g>
        <rect x={gx - bw - 2} y={py + ph - ha} width={bw} height={ha} rx={k.web ? 3 : 0} fill={colA} />
        <rect x={gx + 2} y={py + ph - hb} width={bw} height={hb} rx={k.web ? 3 : 0} fill={colB} />
      </g>,
    );
    add(T(gx, py + ph + 18, t, { fs: 11, a: 'middle', c: MU(k) }));
  });
  pos.chart = { x: b.x, y, w: c1, h: CH };
  const x2 = b.x + c1 + 12;
  const w2 = b.w - c1 - 12;
  add(Card(k, x2, y, w2, CH));
  add(T(x2 + 16, y + 26, '구분별 비율', { fs: 13, fw: 700, c: INK(k) }));
  add(OptBadge(x2 + w2 - 14, y + 14));
  d.ratio.forEach(([l, p, c], i) => {
    const yy = y + 56 + i * 44;
    add(T(x2 + 16, yy, l, { c: INK(k) }));
    add(T(x2 + w2 - 16, yy, `${p}%`, { fw: 700, a: 'end', c: INK(k) }));
    add(Progress(k, x2 + 16, yy + 9, w2 - 32, p / 100, c));
  });
  add(T(x2 + 16, y + CH - 14, `전체 ${d.total}건 기준`, { fs: 11, c: MU(k) }));
  pos.ratio = { x: x2, y, w: w2, h: CH };

  y += CH + 12;
  add(T(b.x, y + 12, '최근 내역', { fs: 13, fw: 700, c: INK(k) }));
  y += 22;
  const g = Grid(k, b.x, y, b.w, d.columns, d.rows, { sel, onSel: setSel, statusColors: d.statusColors, statusColumn: d.statusColumn });
  add(g.el);
  pos.grid = { x: b.x, y, w: b.w, h: g.h };
  return { els, pos, h: y + g.h - b.y, status: `전체 ${d.total}건` };
};

export const treeGrid: LayoutFn<'treeGrid'> = ({ k, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const TW = 208;
  const gx = b.x + TW + 14;
  const gw = b.w - TW - 14;
  const bo = (k.ch - k.bh) / 2;
  const node = d.tree[d.treeSelected]!;
  add(T(gx, b.y + k.ch / 2 + 5, `${node.text} · ${node.count}건`, { fs: 14, fw: 800, c: INK(k) }));
  const bw = 64;
  const bx = b.x + b.w - 3 * bw - 16;
  (
    [
      ['등록', 'primary'],
      ['수정', ''],
      ['삭제', 'danger'],
    ] as const
  ).forEach(([l, kd], i) => add(Btn(k, bx + i * (bw + 8), b.y + bo, bw, l, kd)));
  pos.buttons = { x: bx, y: b.y + bo, w: 3 * bw + 16, h: k.bh };
  add(TB(k, bx - 12 - 170, b.y, 170, '', { ph: '검색', icon: true }));
  pos.text = { x: bx - 186, y: b.y - 3, w: 178, h: k.ch + 6 };
  const gy = b.y + k.ch + 12;
  const g = Grid(k, gx, gy, gw, d.columns, d.rows, { sel, onSel: setSel, statusColors: d.statusColors, statusColumn: d.statusColumn });
  add(g.el);
  pos.grid = { x: gx, y: gy, w: gw, h: g.h };

  // 우클릭 메뉴의 주요 동작 두 개를 필수 버튼으로도 둡니다 (docs/05 필수/선택 원칙)
  const actions = d.contextMenu.filter((i) => i !== '-').slice(0, 2);
  const ay = gy + g.h + 12;
  const sr = d.rows[sel] ?? d.rows[0]!;
  add(T(gx, ay + k.bh / 2 + 4, `선택: ${sr[1]}`, { fw: 600, c: INK(k) }));
  actions.forEach((l, i) => add(Btn(k, gx + gw - (actions.length - i) * 104 + 8, ay, 96, l, i === 0 ? 'primary' : '')));
  pos.rent = { x: gx + gw - actions.length * 104 + 8, y: ay, w: actions.length * 104 - 8, h: k.bh };
  const H = Math.max(ay + k.bh - b.y, d.tree.length * 24 + 16);
  add(Tree(k, b.x, b.y, TW, H, d.tree, d.treeSelected));
  pos.tree = { x: b.x, y: b.y, w: TW, h: H };

  const MW = 164;
  const items = d.contextMenu;
  const mh = items.filter((i) => i !== '-').length * 26 + items.filter((i) => i === '-').length * 9 + 8;
  const ry = gy + g.hh + sel * g.rH;
  const up = sel > 3;
  const mx = gx + gw * 0.42;
  const my = up ? ry - mh + 6 : ry + g.rH - 4;
  let yy = my + 4;
  const menu = items.map((it, i) => {
    if (it === '-') {
      const l = <line key={i} x1={mx + 8} x2={mx + MW - 8} y1={yy + 4.5} y2={yy + 4.5} stroke="#d6d6d6" />;
      yy += 9;
      return l;
    }
    const y0 = yy;
    yy += 26;
    const danger = it.includes('삭제');
    return (
      <g key={i}>
        {i === 0 && <rect x={mx + 4} y={y0} width={MW - 8} height={26} rx={k.web ? 6 : 0} fill={k.id === 'winform' ? '#cce8ff' : k.sel} />}
        {T(mx + 16, y0 + 17.5, it, { fs: 12, c: danger ? '#c92a2a' : INK(k) })}
        {danger && T(mx + MW - 12, y0 + 17.5, 'Del', { fs: 11, a: 'end', c: MU(k) })}
      </g>
    );
  });
  add(
    <g>
      <rect x={mx} y={my} width={MW} height={mh} rx={k.web ? 10 : k.id === 'wpf' ? 6 : 0} fill={k.web || k.id === 'wpf' ? '#fff' : '#f2f2f2'} stroke={k.web ? k.gb : '#a0a0a0'} filter="url(#mk-dsh)" />
      {menu}
      <path d={`M${mx - 4} ${up ? my + mh - 2 : my + 2} l0 14 l4 -3.5 l3 6 l2.5 -1.2 l-3 -6 l5 -.3z`} fill="#fff" stroke="#111" strokeWidth={0.9} />
    </g>,
  );
  add(OptBadge(mx + MW, up ? my - 22 : my + mh + 4));
  pos.ctx = { x: mx, y: my, w: MW, h: mh };
  return { els, pos, h: H, status: `${node.text} · ${d.rows.length}건 표시 · 선택: ${sr[1]}` };
};
