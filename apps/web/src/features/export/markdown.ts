import { DELIVERABLES, FRAMEWORKS, GRADES, LAYOUTS, LEVEL_LABEL, type Assignment } from '@obp/shared';
import type { PinItem } from '../../renderer/widgets';

// 채택 과제 Markdown 내보내기 — docs/02_ui-spec.md#7-내보내기
// 신입사원에게 그대로 전달할 문서라, 이 파일만 읽어도 과제를 이해할 수 있게 씁니다.

const days = ({ min, max }: Assignment['estimatedDays']) => (min === max ? `${min}일` : `${min}~${max}일`);
const code = (t: string) => `\`${t.replace(/`/g, "'")}\``;
const cell = (t: string) => t.replace(/\|/g, '\\|').replace(/\n/g, ' ');
const list = (items: string[]) => items.map((t) => `- ${t}`).join('\n');

/** 파일 이름: 과제 제목_프레임워크_난이도 (파일 시스템에서 쓸 수 없는 문자는 _) */
export function exportBaseName(a: Assignment): string {
  return `${a.title}_${FRAMEWORKS[a.framework].label}_${LEVEL_LABEL[a.level]}`.replace(/[\\/:*?"<>|#%\s]+/g, '_');
}

export function toMarkdown(a: Assignment, pins: PinItem[], opts: { imageFile?: string; date?: Date } = {}): string {
  const fw = FRAMEWORKS[a.framework];
  const basic = a.level === 'basic';
  const out: string[] = [];
  const h = (level: number, t: string) => out.push('', `${'#'.repeat(level)} ${t}`, '');

  out.push(`# ${a.title}`, '');
  out.push(`> ${fw.label} · ${LEVEL_LABEL[a.level]} (${basic ? '기초 UI 과제 · CRUD 없음' : '실무 CRUD 과제 · DB 연동'}) · 화면 유형: ${LAYOUTS[a.layout].name} · 예상 소요: ${days(a.estimatedDays)}`);
  out.push(`> 요청 부서 예시: ${a.team}`);

  h(2, '1. 과제 개요');
  out.push(a.scenario, '');
  out.push(`- **학습 목표**: ${a.learningGoal}`, `- **산출물**: ${DELIVERABLES[a.level]}`);

  h(2, '2. 구현 목표 예시 화면');
  if (opts.imageFile) out.push(`![${a.title} 예시 화면](${encodeURI(opts.imageFile)})`, '', `> 화면 그림은 같은 폴더의 ${code(opts.imageFile)} 파일입니다.`, '');
  out.push('화면 번호별 컨트롤:', '');
  pins.forEach((p, i) => out.push(`${i + 1}. ${code(p.name)} — ${p.desc}`));

  h(2, '3. 필수 사용 컨트롤 · 핵심 기술');
  out.push(`- **컨트롤**: ${a.controls.map(code).join(', ')}`, `- **기술**: ${a.tech.join(', ')}`);

  h(2, `4. 코드 구조 · ${a.architecture.title}`);
  for (const l of a.architecture.layers) out.push(`- **${l.name}** (${l.role}): ${l.files.map(code).join(', ')}`);
  if (a.architecture.common) out.push(`- **공통 모델**: ${a.architecture.common.map(code).join(', ')}`);
  out.push('', '지켜야 할 규칙:', '', list(a.architecture.rules));
  if (a.architecture.note) out.push('', `> ${a.architecture.note}`);

  h(2, `5. ${basic ? '기능 요구사항' : '기능별 CRUD 요구사항'} (필수)`);
  out.push('이 항목만 완성하면 과제 통과 기준을 채울 수 있습니다.');
  for (const r of a.requirements) {
    h(3, `${r.key}. ${r.name}`);
    out.push(list(r.items));
  }

  h(2, '6. 선택 기능 (가산점)');
  out.push('필수 기능을 모두 끝낸 뒤 시간이 남으면 도전합니다.', '', list(a.optionalFeatures));

  if (a.hints?.length) {
    h(2, '7. 구현 힌트');
    out.push(list(a.hints));
  }

  h(2, `${a.hints?.length ? 8 : 7}. 예외 처리 조건`);
  out.push(list(a.exceptions));

  let n = a.hints?.length ? 9 : 8;
  if (a.dataGuide) {
    h(2, `${n++}. 데이터 설계 가이드`);
    out.push('DB 테이블과 API는 정해 주지 않습니다. 아래 질문에 답하며 직접 설계하고, 설계 이유를 설명할 수 있어야 합니다.', '');
    a.dataGuide.questions.forEach((q, i) => out.push(`${i + 1}. ${q}`));
    out.push('', `**제출물**: ${a.dataGuide.deliverable}`);
  }

  h(2, `${n}. 채점표`);
  const base = a.rubric.filter((g) => !g.bonus);
  const bonus = a.rubric.filter((g) => g.bonus);
  out.push('| 구분 | 항목 | 배점 |', '|---|---|---:|');
  for (const g of base) for (const it of g.items) out.push(`| ${cell(g.group)} | ${cell(it.text)} | ${it.points} |`);
  out.push(`| **합계** | | **100** |`);
  if (bonus.length) {
    out.push('', '가산점:', '', '| 구분 | 항목 | 배점 |', '|---|---|---:|');
    for (const g of bonus) for (const it of g.items) out.push(`| ${cell(g.group)} | ${cell(it.text)} | +${it.points} |`);
  }
  out.push('', `등급: ${GRADES.map((g, i) => (g.min > 0 ? `${g.min}점 이상 ${g.label}` : `${GRADES[i - 1]?.min ?? 0}점 미만 ${g.label}`)).join(' / ')}`);

  out.push('', '---', '', `온보딩 과제 생성기로 만든 과제입니다 · ${(opts.date ?? new Date()).toISOString().slice(0, 10)}`, '');
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}
