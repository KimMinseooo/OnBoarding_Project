import {
  AssignmentDraftSchema,
  AssignmentSchema,
  FRAMEWORKS,
  LAYOUT_IDS,
  composeAssignment,
  levelOfLayout,
  type AssignmentDraft,
  type GenerateRequest,
  type LayoutId,
} from '@obp/shared';
import { ClaudeApiError, type CallTool, type Message } from '../claude/client';
import { SYSTEM_PROMPT, buildUserMessage, draftTool, retryMessage } from '../prompts/assignment';
import { GenerationError } from './errors';
import type { Generator } from './generator';

// 생성 흐름: 화면 유형 선택 → 프롬프트 → Claude → Draft 검증 → (실패 시 1회 재시도) → 조립 → 최종 검증
// 기준 문서: docs/08_prompt.md#요청-흐름

type Options = {
  call: CallTool;
  /** 화면 유형별 형식 예시로 쓸 fixtures */
  examples: AssignmentDraft[];
  random?: () => number;
  log?: (msg: string) => void;
};

/** 첫 제안은 프레임워크의 첫 화면 유형, 이후에는 직전과 다른 유형 중 무작위 */
export function pickLayout(req: GenerateRequest, random: () => number = Math.random): LayoutId {
  if (req.recent.length === 0) return FRAMEWORKS[req.framework].firstLayout[req.level];
  const pool = LAYOUT_IDS.filter((l) => levelOfLayout(l) === req.level && l !== req.recent[0]!.layout);
  return pool[Math.floor(random() * pool.length)]!;
}

const fmt = (issues: { path: PropertyKey[]; message: string }[]) => issues.map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message));

/** Claude 결과(도구 입력)를 검사합니다. 문제 목록이 비면 통과 */
export function checkDraft(input: unknown, req: GenerateRequest, layout: LayoutId, id: string) {
  const raw = typeof input === 'object' && input !== null ? input : {};
  const parsed = AssignmentDraftSchema.safeParse({ ...raw, level: req.level, layout });
  if (!parsed.success) return { issues: fmt(parsed.error.issues) };
  const draft = parsed.data;
  const issues: string[] = [];
  if (req.recent.some((r) => r.title === draft.title)) issues.push(`title: 최근 제안 "${draft.title}"과(와) 겹칩니다. 다른 업무로 바꿀 것`);
  const final = AssignmentSchema.safeParse(composeAssignment(draft, req.framework, id));
  if (!final.success) issues.push(...fmt(final.error.issues));
  return issues.length ? { issues } : { assignment: final.data! };
}

export function createClaudeGenerator({ call, examples, random = Math.random, log = console.log }: Options): Generator {
  return async (req) => {
    const layout = pickLayout(req, random);
    const tool = draftTool(req.level, layout);
    const messages: Message[] = [{ role: 'user', content: buildUserMessage(req, layout, examples.find((d) => d.layout === layout)) }];
    const started = Date.now();

    for (let attempt = 1; attempt <= 2; attempt++) {
      let reply;
      try {
        reply = await call({ system: SYSTEM_PROMPT, messages, tool });
      } catch (e) {
        if (e instanceof ClaudeApiError) throw new GenerationError(502, 'UPSTREAM_ERROR', e.message);
        throw e;
      }
      const id = `${layout}-${req.framework}-${Date.now().toString(36)}`;
      const result = reply.toolUse
        ? checkDraft(reply.toolUse.input, req, layout, id)
        : { issues: [`${tool.name} 도구로 결과를 반환하지 않았습니다 (stop_reason: ${reply.stopReason})`] };
      log(
        `[생성] ${req.framework}/${req.level}/${layout} ${attempt}회차 ${result.issues ? `검증 실패 ${result.issues.length}건` : '성공'} ` +
          `· 토큰 입력 ${reply.usage.input_tokens} 출력 ${reply.usage.output_tokens} · ${((Date.now() - started) / 1000).toFixed(1)}초`,
      );
      if (!result.issues) return { assignment: result.assignment };
      if (attempt === 2) throw new GenerationError(422, 'INVALID_OUTPUT', `생성 결과가 형식 검사를 두 번 통과하지 못했습니다: ${result.issues.slice(0, 5).join(' / ')}`);

      // 재시도: 앞의 답을 그대로 두고, 도구 결과로 오류를 알려 같은 아이디어를 고치게 함
      messages.push({ role: 'assistant', content: reply.content });
      const text = retryMessage(result.issues);
      messages.push({
        role: 'user',
        content: reply.toolUse ? [{ type: 'tool_result', tool_use_id: reply.toolUse.id, content: text, is_error: true }] : text,
      });
    }
    throw new Error('도달하지 않음');
  };
}
