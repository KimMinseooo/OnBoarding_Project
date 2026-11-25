import type { AppConfig } from '../config';

// Claude Messages API 호출 (도구 강제 사용 = 구조화 출력) — docs/08_prompt.md
// SDK 대신 fetch를 씁니다: 의존성이 없고, 사내 게이트웨이 주소(ANTHROPIC_BASE_URL)로 바꾸기 쉽습니다 (D-020).

export type ToolDef = { name: string; description: string; input_schema: Record<string, unknown> };
export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean };
export type Message = { role: 'user' | 'assistant'; content: string | ContentBlock[] };
export type ToolCall = {
  system: string;
  messages: Message[];
  tool: ToolDef;
  maxTokens?: number;
};
export type ToolReply = {
  content: ContentBlock[];
  toolUse?: { id: string; input: unknown };
  stopReason: string;
  usage: { input_tokens: number; output_tokens: number };
};
export type CallTool = (call: ToolCall) => Promise<ToolReply>;

/** Claude API 자체가 실패한 경우 (네트워크, 인증, 시간 초과, 과부하 등) */
export class ClaudeApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ClaudeApiError';
  }
}

export function createClaudeClient(config: AppConfig, fetchFn: typeof fetch = fetch): CallTool {
  return async ({ system, messages, tool, maxTokens = 8192 }) => {
    let res: Response;
    try {
      res = await fetchFn(`${config.anthropicBaseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': config.anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.anthropicModel,
          max_tokens: maxTokens,
          system,
          tools: [tool],
          tool_choice: { type: 'tool', name: tool.name },
          messages,
        }),
        signal: AbortSignal.timeout(config.anthropicTimeoutMs),
      });
    } catch (e) {
      const timeout = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError');
      throw new ClaudeApiError(timeout ? `Claude 응답이 ${config.anthropicTimeoutMs / 1000}초 안에 오지 않았습니다` : `Claude API에 연결하지 못했습니다 (${(e as Error).message})`);
    }
    const text = await res.text();
    if (!res.ok) {
      let detail = text.slice(0, 300);
      try {
        detail = (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? detail;
      } catch {
        /* JSON이 아니면 앞부분만 */
      }
      throw new ClaudeApiError(`Claude API 오류 ${res.status}: ${detail}`, res.status);
    }
    const body = JSON.parse(text) as { content: ContentBlock[]; stop_reason: string; usage: ToolReply['usage'] };
    const use = body.content.find((b): b is Extract<ContentBlock, { type: 'tool_use' }> => b.type === 'tool_use' && b.name === tool.name);
    return { content: body.content, toolUse: use && { id: use.id, input: use.input }, stopReason: body.stop_reason, usage: body.usage };
  };
}
