import { Btn, Card, Click, Combo, FieldRow, GH, Group, INK, MU, Progress, Radio, T, TB, bag, fieldText, gap, tw, type Pos } from '../kit';
import { List, Steps, Tabs } from '../widgets';
import type { LayoutFn } from './types';

// 초급 화면 유형 6종 — 구성은 docs/07_layouts.md#초급

export const form: LayoutFn<'form'> = ({ k, d }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const lw = k.web ? 100 : 88;
  const LW = Math.round(b.w * 0.57);
  const gh = GH(k);
  let y = b.y + gh + 4;
  const rows = d.fields.map((f) => {
    const r = FieldRow(k, b.x + 16, y, LW - 32, f, lw, pos);
    y += r.h + gap(k);
    return r.el;
  });
  const gH = Math.max(y - b.y + 6, gh + d.fields.length * 24 + 130);
  add(Group(k, b.x, b.y, LW, gH, d.groupLabel));
  rows.forEach(add);
  pos.group = { x: b.x, y: b.y, w: LW, h: gH };

  const px = b.x + LW + 14;
  const pw = b.w - LW - 14;
  add(Group(k, px, b.y, pw, gH, '입력 내용 미리보기'));
  let py = b.y + gh + 14;
  for (const f of d.fields) {
    const v = fieldText(f);
    add(T(px + 16, py, f.label, { fs: 11.5, c: MU(k) }));
    add(T(px + pw - 16, py, v.length > 18 ? `${v.slice(0, 17)}…` : v, { fw: 600, a: 'end', c: INK(k) }));
    add(<line x1={px + 16} x2={px + pw - 16} y1={py + 8} y2={py + 8} stroke={k.web ? '#f0f1f3' : '#e4e4e4'} />);
    py += 24;
  }
  const dy = b.y + gH - 70;
  add(
    <g>
      <rect x={px + 14} y={dy} width={pw - 28} height={56} rx={k.web ? 8 : k.r} fill="#ebfbee" stroke="#b2f2bb" />
      <circle cx={px + 34} cy={dy + 28} r={10} fill="#2f9e44" />
      <path d={`M${px + 29} ${dy + 28} l3.5 3.5 l6 -7`} stroke="#fff" strokeWidth={2} fill="none" />
      {T(px + 52, dy + 24, d.doneMessage[0], { fw: 700, c: '#2b8a3e' })}
      {T(px + 52, dy + 41, d.doneMessage[1], { fs: 11, c: '#2b8a3e' })}
    </g>,
  );
  pos.result = { x: px, y: b.y, w: pw, h: gH };
  const by = b.y + gH + 14;
  const bw = 88;
  add(Btn(k, b.x + LW - 2 * bw - 8, by, bw, '초기화'));
  add(Btn(k, b.x + LW - bw, by, bw, '제출', 'primary'));
  pos.buttons = { x: b.x + LW - 2 * bw - 8, y: by, w: 2 * bw + 8, h: k.bh };
  return { els, pos, h: gH + 14 + k.bh, status: `입력 항목 ${d.fields.length}개 · 필수 ${d.fields.filter((f) => f.required).length}개` };
};

export const calc: LayoutFn<'calc'> = ({ k, d }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const lw = k.web ? 92 : 84;
  const LW = Math.round(b.w * 0.5);
  let y = b.y + GH(k) + 4;
  const rows = d.fields.map((f) => {
    const r = FieldRow(k, b.x + 16, y, LW - 32, f, lw, pos);
    y += r.h + gap(k);
    return r.el;
  });
  y += 6;
  const cbY = y;
  y += k.bh + 16;
  const gH = Math.max(y - b.y, 150 + d.breakdown.length * 26);
  add(Group(k, b.x, b.y, LW, gH, '입력 조건'));
  rows.forEach(add);
  add(Btn(k, b.x + 16, cbY, LW - 32, '계산하기', 'primary'));
  pos.calcBtn = { x: b.x + 16, y: cbY, w: LW - 32, h: k.bh };
  pos.group = { x: b.x, y: b.y, w: LW, h: gH };

  const px = b.x + LW + 14;
  const pw = b.w - LW - 14;
  const ry = b.y;
  add(Card(k, px, ry, pw, gH));
  add(T(px + 22, ry + 30, d.result.label, { fs: 12.5, fw: 600, c: MU(k) }));
  add(T(px + 22, ry + 76, d.result.value, { fs: 38, fw: 800, c: INK(k) }));
  add(T(px + 28 + tw(d.result.value, 38) * 0.8, ry + 76, d.result.unit, { fs: 16, fw: 700, c: INK(k) }));
  add(<line x1={px + 22} x2={px + pw - 22} y1={ry + 96} y2={ry + 96} stroke={k.web ? '#e5e7eb' : '#d6d6d6'} />);
  d.breakdown.forEach(([l, v], i) => {
    const yy = ry + 120 + i * 26;
    add(T(px + 22, yy, l, { c: MU(k) }));
    add(T(px + pw - 22, yy, v, { fw: 600, a: 'end', c: INK(k) }));
  });
  add(
    <g>
      <circle cx={px + 30} cy={ry + gH - 22} r={7} fill="none" stroke={MU(k)} />
      {T(px + 30, ry + gH - 18, 'i', { fs: 10, fw: 700, a: 'middle', c: MU(k) })}
      {T(px + 44, ry + gH - 18, d.note, { fs: 11, c: MU(k) })}
    </g>,
  );
  pos.result = { x: px, y: ry, w: pw, h: gH };
  return { els, pos, h: gH, status: `계산 완료 · ${d.result.label} ${d.result.value}${d.result.unit}` };
};

export const todo: LayoutFn<'todo'> = ({ k, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const { x, w } = b;
  let y = b.y;
  const aw = 92;
  const cw = 112;
  const tw_ = w - aw - cw - 20;
  const bo = (k.ch - k.bh) / 2;
  add(TB(k, x, y, tw_, '', { ph: d.placeholder }));
  pos.text = { x: x - 4, y: y - 3, w: tw_ + 8, h: k.ch + 6 };
  add(Combo(k, x + tw_ + 10, y, cw, '우선순위: 보통'));
  pos.combo = { x: x + tw_ + 6, y: y - 3, w: cw + 8, h: k.ch + 6 };
  add(Btn(k, x + w - aw, y + bo, aw, '추가', 'primary'));
  pos.addBtn = { x: x + w - aw, y: y + bo, w: aw, h: k.bh };
  y += k.ch + 14;
  let rx = x;
  ['전체', '진행 중', '완료'].forEach((t, i) => {
    const r = Radio(k, rx, y, t, i === 0);
    add(r.el);
    rx += r.w;
  });
  pos.radio = { x: x - 4, y: y - 3, w: rx - x, h: k.ch + 6 };
  y += k.ch + 10;
  const items = d.items.map((it) => ({ t: it.text, done: it.done, tag: it.tag, tagColor: d.tagColors[it.tag] }));
  const l = List(k, x, y, w, items, { rh: k.web ? 38 : 30, check: true, sel, onSel: setSel });
  add(l.el);
  pos.list = { x, y, w, h: l.h };
  y += l.h + 16;
  const done = d.items.filter((i) => i.done).length;
  const n = d.items.length;
  add(T(x, y + k.ch / 2 + 4, `완료 ${done} / ${n}`, { fw: 700, c: INK(k) }));
  add(Progress(k, x + 86, y + k.ch / 2 - (k.web ? 4 : 6), 200, done / n));
  add(T(x + 298, y + k.ch / 2 + 4, `${Math.round((done / n) * 100)}%`, { c: MU(k) }));
  pos.progress = { x: x + 82, y, w: 250, h: k.ch };
  add(Btn(k, x + w - 96, y + bo, 96, '선택 삭제', 'danger'));
  add(Btn(k, x + w - 96 - 8 - 138, y + bo, 138, '완료 항목 지우기'));
  pos.buttons = { x: x + w - 242, y: y + bo, w: 242, h: k.bh };
  return { els, pos, h: y + k.ch - b.y, status: `할 일 ${n}개 · 완료 ${done}개` };
};

export const settings: LayoutFn<'settings'> = ({ k, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const act = sel % d.tabs.length;
  const most = Math.max(...d.panels.map((p) => p.length));
  const th = k.web ? 40 : 26;
  const ph = th + (k.web ? 18 : 16) + most * (k.ch + gap(k)) + 18;
  const t = Tabs(k, b.x, b.y, b.w, ph, d.tabs, act, setSel);
  add(t.el);
  pos.tabs = { x: b.x, y: b.y, w: t.headWidth, h: th };
  let y = t.top;
  for (const f of d.panels[act]!) {
    const r = FieldRow(k, b.x + 22, y, Math.min(b.w - 44, 560), f, 130, pos);
    add(r.el);
    y += r.h + gap(k);
  }
  const by = b.y + ph + 14;
  const bw = 84;
  add(Btn(k, b.x, by, 116, '기본값 복원'));
  ['취소', '적용', '확인'].forEach((l, i) => add(Btn(k, b.x + b.w - 3 * bw - 16 + i * (bw + 8), by, bw, l, i === 2 ? 'primary' : '')));
  pos.buttons = { x: b.x + b.w - 3 * bw - 16, y: by, w: 3 * bw + 16, h: k.bh };
  return { els, pos, h: ph + 14 + k.bh, status: `설정 · ${d.tabs[act]} 탭` };
};

export const wizard: LayoutFn<'wizard'> = ({ k, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const n = d.steps.length;
  const act = sel % n;
  const most = Math.max(...d.pages.map((p) => p.length));
  add(Steps(k, b.x, b.y, b.w, d.steps, act, setSel));
  pos.steps = { x: b.x + 16, y: b.y - 6, w: b.w - 32, h: 62 };
  let y = b.y + 70;
  const gH = GH(k) + most * (k.ch + gap(k)) + 14;
  add(Group(k, b.x, y, b.w, gH, `${act + 1}단계 · ${d.steps[act]}`));
  pos.group = { x: b.x, y, w: b.w, h: gH };
  let fy = y + GH(k) + 4;
  for (const f of d.pages[act]!) {
    const r = FieldRow(k, b.x + 18, fy, Math.min(b.w - 36, 540), f, 104, pos);
    add(r.el);
    fy += r.h + gap(k);
  }
  y += gH + 16;
  const pct = (act + 1) / n;
  add(T(b.x, y + k.bh / 2 + 4, `진행률 ${Math.round(pct * 100)}%`, { fw: 600, c: INK(k) }));
  add(Progress(k, b.x + 92, y + k.bh / 2 - (k.web ? 4 : 6), 220, pct));
  pos.progress = { x: b.x + 88, y: y + 2, w: 228, h: k.bh - 4 };
  const bw = 92;
  const bx = b.x + b.w - 2 * bw - 8;
  const last = act === n - 1;
  const agreed = d.pages[n - 1]!.filter((f) => f.type === 'check').every((f) => Array.isArray(f.selected) && f.selected.length > 0);
  add(<Click onClick={act > 0 ? () => setSel(act - 1) : undefined}>{Btn(k, bx, y, bw, '이전', '', { dis: act === 0 })}</Click>);
  add(<Click onClick={!last ? () => setSel(act + 1) : undefined}>{Btn(k, bx + bw + 8, y, bw, last ? '제출' : '다음', 'primary', { dis: last && !agreed })}</Click>);
  pos.buttons = { x: bx, y, w: 2 * bw + 8, h: k.bh };
  return { els, pos, h: y + k.bh - b.y, status: `${act + 1}/${n}단계 · ${d.steps[act]}` };
};

export const lookup: LayoutFn<'lookup'> = ({ k, d, sel, setSel }, b) => {
  const { els, add } = bag();
  const pos: Pos = {};
  const LW = Math.round(Math.min(310, b.w * 0.42));
  const p = d.people[sel] ?? d.people[0]!;
  let y = b.y;
  add(TB(k, b.x, y, LW, '', { ph: '이름 또는 부서 검색', icon: true }));
  pos.text = { x: b.x - 4, y: y - 3, w: LW + 8, h: k.ch + 6 };
  y += k.ch + 10;
  add(Combo(k, b.x, y, 150, '전체 부서'));
  pos.combo = { x: b.x - 4, y: y - 3, w: 158, h: k.ch + 6 };
  add(T(b.x + LW, y + k.ch / 2 + 4, `${d.people.length}명`, { a: 'end', c: MU(k) }));
  y += k.ch + 10;
  const l = List(k, b.x, y, LW, d.people.map((q) => ({ t: `${q.name} ${q.position}`, s: `${q.dept} · 내선 ${q.ext}` })), { rh: 44, two: true, sel, onSel: setSel });
  add(l.el);
  pos.list = { x: b.x, y, w: LW, h: l.h };
  const H = y + l.h - b.y;
  const px = b.x + LW + 16;
  const pw = b.w - LW - 16;
  add(Group(k, px, b.y, pw, H, '상세 정보'));
  pos.detail = { x: px, y: b.y, w: pw, h: H };
  const ay = b.y + GH(k) + 38;
  add(
    <g>
      <circle cx={px + 52} cy={ay} r={30} fill={k.accent} fillOpacity={0.14} />
      {T(px + 52, ay + 8, p.name.slice(0, 1), { fs: 22, fw: 800, a: 'middle', c: k.accent })}
    </g>,
  );
  add(T(px + 96, ay - 2, p.name, { fs: 19, fw: 800, c: INK(k) }));
  add(T(px + 96, ay + 18, `${p.dept} · ${p.position}`, { c: MU(k) }));
  (
    [
      ['부서', p.dept],
      ['직급', p.position],
      ['내선번호', p.ext],
      ['이메일', p.mail],
      ['근무지', p.location],
    ] as const
  ).forEach(([a, v], i) => {
    const yy = ay + 58 + i * 30;
    add(T(px + 22, yy, a, { c: MU(k) }));
    add(T(px + 112, yy, v, { fw: 600, c: INK(k) }));
    add(<line x1={px + 22} x2={px + pw - 22} y1={yy + 11} y2={yy + 11} stroke={k.web ? '#f0f1f3' : '#e2e2e2'} />);
  });
  const by = b.y + H - k.bh - 16;
  add(Btn(k, px + pw - 22 - 120, by, 120, '이메일 복사', 'primary'));
  add(Btn(k, px + pw - 22 - 248, by, 120, '메신저 보내기'));
  pos.buttons = { x: px + pw - 270, y: by, w: 248, h: k.bh };
  return { els, pos, h: H, status: `검색 결과 ${d.people.length}명 · 선택: ${p.name}` };
};
