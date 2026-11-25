import { z } from 'zod';
import {
  CRUD_KEYS,
  CRUD_NAMES,
  FRAMEWORKS,
  LAYOUTS,
  LEVEL_LABEL,
  LEVEL_SUMMARY,
  controlName,
  draftVariantOf,
  type AssignmentDraft,
  type FrameworkId,
  type GenerateRequest,
  type LayoutId,
  type Level,
} from '@obp/shared';
import type { ToolDef } from '../claude/client';

// 프롬프트 템플릿 — 기준 문서: docs/08_prompt.md (문장을 바꾸면 문서도 함께)
// 규칙 값은 카탈로그(05·06·07 코드)에서 읽어 넣고, 여기에는 문장 틀만 둡니다.

export const TOOL_NAME = 'create_assignment_draft';

export const SYSTEM_PROMPT = `너는 IT 회사의 15년 차 풀스택 개발자이자 신입 교육 담당자다.
신입사원이 실무 투입 전에 2주 동안 수행할 과제의 "업무 내용"을 만든다.

원칙:
- 실제 회사에서 흔히 있는 사내 업무 문제를 고른다. (총무·인사·재무·구매·고객지원·생산 등)
- 필수 요구사항은 편의 기능 없이도 완성 가능한 핵심 동작만 쓴다.
- 편의 기능(드래그 앤 드롭, 차트, 내보내기, 정렬·페이징, 우클릭 메뉴, 시각 강조 등)은 optionalFeatures에만 넣는다.
- 예외 조건은 "어떤 입력이면 어떻게 되는지"가 드러나게 쓴다.
- 인물·회사 이름은 실존하지 않는 예시로 쓴다.
- 모든 문장은 한국어, 명세서 말투(~한다/명사형)로 짧게 쓴다.
- 결과는 반드시 ${TOOL_NAME} 도구로만 반환한다.`;

/** 서버가 채우는 필드(id·level·layout)를 빼고, 난이도별 필수 항목을 필수로 바꾼 도구 스키마 */
export function draftToolSchema(level: Level, layout: LayoutId) {
  const base = draftVariantOf(layout).omit({ id: true, level: true, layout: true });
  const { learningGoal, logicClass, businessRule, relationHint } = base.shape;
  const shaped =
    level === 'basic'
      ? base.omit({ businessRule: true, relationHint: true }).extend({ learningGoal: learningGoal.unwrap(), logicClass: logicClass.unwrap() })
      : base.omit({ learningGoal: true, logicClass: true }).extend({ businessRule: businessRule.unwrap(), relationHint: relationHint.unwrap() });
  const json = z.toJSONSchema(shaped, { io: 'input', unrepresentable: 'any' }) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

export function draftTool(level: Level, layout: LayoutId): ToolDef {
  return {
    name: TOOL_NAME,
    description: `신입사원 과제의 업무 내용(${LEVEL_LABEL[level]}, 화면 유형 ${layout})을 반환한다.`,
    input_schema: draftToolSchema(level, layout),
  };
}

/** 서버가 붙이는 값은 예시에서 뺍니다 (Claude가 그대로 베끼지 않도록 "형식 예시"로만 사용) */
function exampleJson(example: AssignmentDraft) {
  const { id: _id, level: _level, layout: _layout, ...rest } = example;
  return JSON.stringify(rest, null, 1);
}

export function buildUserMessage(req: GenerateRequest, layout: LayoutId, example?: AssignmentDraft): string {
  const fw = FRAMEWORKS[req.framework as FrameworkId];
  const info = LAYOUTS[layout];
  const level = req.level;
  const cards =
    level === 'basic'
      ? '기능 카드 4개. key는 "1","2","3","4" 순서, name은 짧은 기능 이름, items는 구체적인 동작 1~4개'
      : `CRUD 카드 4개. key는 ${CRUD_KEYS.join(',')} 순서 (${CRUD_KEYS.map((k) => `${k}=${CRUD_NAMES[k]}`).join(', ')}), items는 업무 기준 동작 1~4개 (구현 기술은 서버가 덧붙임)`;
  const recent = req.recent.length ? req.recent.map((r) => `- ${r.title} (${LAYOUTS[r.layout]?.name ?? r.layout})`).join('\n') : '- (없음)';

  const lines = [
    `프레임워크: ${fw.label} (${fw.kind === 'web' ? '웹' : '데스크톱'})`,
    `난이도: ${LEVEL_LABEL[level]} — ${LEVEL_SUMMARY[level]}`,
    '',
    `화면 유형: ${info.name} (${layout})`,
    info.learningGoal ? `- 학습 목표: ${info.learningGoal}` : '- 학습 목표: learningGoal에 이 과제로 익힐 기술을 한 줄로 쓴다',
    `- 화면에 들어가는 컨트롤: ${info.controls.map((c) => controlName(req.framework, c)).join(', ')}`,
    `- 예시 화면 핵심 요소: ${info.pins.map((p) => p.desc).join(' / ')}`,
    '',
    '최근 제안 (업무 주제가 겹치지 않게):',
    recent,
    '',
    `요구사항 카드 형식: ${cards}`,
    'optionalFeatures: 가산점용 편의 기능 1~4개',
    'exceptions: 업무 예외 조건 정확히 3개',
    level === 'basic'
      ? 'logicClass: 화면과 분리할 로직 클래스 이름 (PascalCase)'
      : 'businessRule: 이 업무에만 있는 규칙 한 줄 / relationHint: DB 테이블 관계를 고민하게 하는 질문 한 줄',
    'entity: name은 PascalCase 영문, slug는 kebab-case 영문',
    `mockup: appTitle은 화면 제목${fw.kind === 'web' ? ', nav는 상단 메뉴 3~5개' : ''}, data는 업무에 맞는 예시 값으로 채운다 (목록·표는 실제처럼 보이게 4~8행)`,
  ];
  if (example) {
    lines.push('', '형식 참고용 예시 (같은 화면 유형의 다른 과제다. 업무 내용·문장은 절대 그대로 쓰지 말고 형식만 참고할 것):', '```json', exampleJson(example), '```');
  }
  return lines.join('\n');
}

export function retryMessage(issues: string[]): string {
  return ['이전 결과가 다음 규칙을 어겼다. 같은 아이디어로 고쳐서 다시 반환하라.', ...issues.map((i) => `- ${i}`)].join('\n');
}
