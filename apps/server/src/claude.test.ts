import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { FRAMEWORKS, GenerateRequestSchema, GenerateResponseSchema, LAYOUT_IDS, levelOfLayout, type AssignmentDraft, type LayoutId } from '@obp/shared';
import { createApp } from './app';
import { ClaudeApiError, createClaudeClient, type CallTool, type ToolCall, type ToolReply } from './claude/client';
import { loadConfig } from './config';
import { loadDrafts } from './mock/fixtures';
import { SYSTEM_PROMPT, buildUserMessage, draftToolSchema } from './prompts/assignment';
import { createClaudeGenerator, pickLayout } from './services/claudeGenerator';

const drafts = loadDrafts();
const exampleOf = (layout: LayoutId) => drafts.find((d) => d.layout === layout)!;
const asInput = (d: AssignmentDraft) => {
  const { id: _i, level: _l, layout: _y, ...rest } = d;
  return rest;
};
const reply = (input: unknown, id = 'tu_1'): ToolReply => ({
  content: [{ type: 'tool_use', id, name: 'create_assignment_draft', input }],
  toolUse: { id, input },
  stopReason: 'tool_use',
  usage: { input_tokens: 10, output_tokens: 20 },
});
const req = (body: object) => GenerateRequestSchema.parse(body);
const config = loadConfig({ USE_MOCK: 'false', ANTHROPIC_API_KEY: 'test-key', ANTHROPIC_MODEL: 'test-model', PORT: '0' });

/** 프롬프트를 보고 같은 화면 유형의 fixture를 돌려주는 가짜 Claude */
const fakeClaude =
  (mutate: (input: Record<string, unknown>, n: number) => unknown = (i) => i): CallTool & { calls: ToolCall[] } => {
    const calls: ToolCall[] = [];
    const fn = (async (call: ToolCall) => {
      calls.push(structuredClone(call));
      const layout = /\(([a-zA-Z]+)\)$/m.exec(String(call.messages[0]!.content).split('\n').find((l) => l.startsWith('화면 유형:'))!)![1] as LayoutId;
      return reply(mutate(asInput(exampleOf(layout)) as Record<string, unknown>, calls.length));
    }) as CallTool & { calls: ToolCall[] };
    fn.calls = calls;
    return fn;
  };

describe('도구 스키마·프롬프트', () => {
  it.each(LAYOUT_IDS)('%s 스키마는 object이고 서버가 채우는 필드가 없다', (layout) => {
    const level = levelOfLayout(layout);
    const s = draftToolSchema(level, layout) as { type: string; properties: Record<string, unknown>; required: string[] };
    expect(s.type).toBe('object');
    for (const k of ['id', 'level', 'layout']) expect(s.properties[k]).toBeUndefined();
    expect(s.required).toEqual(expect.arrayContaining(level === 'basic' ? ['learningGoal', 'logicClass', 'mockup'] : ['businessRule', 'relationHint', 'mockup']));
    expect(JSON.stringify(s)).not.toContain('"$schema"');
  });

  it('사용자 메시지에 카탈로그 값과 최근 제안이 들어간다', () => {
    const msg = buildUserMessage(req({ framework: 'wpf', level: 'intermediate', recent: [{ title: '비품 관리', layout: 'gridForm' }] }), 'kanban', exampleOf('kanban'));
    expect(msg).toContain('C# WPF');
    expect(msg).toContain('칸반 보드 (kanban)');
    expect(msg).toContain('- 비품 관리');
    expect(msg).toContain('R,C,U,D');
    expect(msg).toContain('```json');
    expect(SYSTEM_PROMPT).toContain('create_assignment_draft');
  });
});

describe('화면 유형 선택', () => {
  it('첫 제안은 프레임워크의 첫 유형, 이후는 같은 난이도에서 직전과 다른 유형', () => {
    expect(pickLayout(req({ framework: 'react', level: 'basic' }))).toBe(FRAMEWORKS.react.firstLayout.basic);
    for (let i = 0; i < 30; i++) {
      const l = pickLayout(req({ framework: 'react', level: 'intermediate', recent: [{ title: 'x', layout: 'kanban' }] }));
      expect(levelOfLayout(l)).toBe('intermediate');
      expect(l).not.toBe('kanban');
    }
  });
});

describe('Claude 생성기', () => {
  const log = () => {};

  it('정상 응답을 조립해 돌려준다 (호출 1회)', async () => {
    const call = fakeClaude();
    const gen = createClaudeGenerator({ call, examples: drafts, log });
    const { assignment } = await gen(req({ framework: 'python', level: 'basic' }));
    expect(assignment.framework).toBe('python');
    expect(assignment.layout).toBe(FRAMEWORKS.python.firstLayout.basic);
    expect(call.calls).toHaveLength(1);
    expect(call.calls[0]!.tool.name).toBe('create_assignment_draft');
  });

  it('검증에 실패하면 오류를 도구 결과로 붙여 1회 재시도한다', async () => {
    const call = fakeClaude((input, n) => (n === 1 ? { ...input, exceptions: ['하나뿐'] } : input));
    const gen = createClaudeGenerator({ call, examples: drafts, log });
    const { assignment } = await gen(req({ framework: 'winform', level: 'intermediate' }));
    expect(assignment.level).toBe('intermediate');
    expect(call.calls).toHaveLength(2);
    const retry = call.calls[1]!.messages;
    expect(retry).toHaveLength(3);
    expect(retry[1]!.role).toBe('assistant');
    const result = (retry[2]!.content as { type: string; is_error?: boolean; content: string }[])[0]!;
    expect(result.type).toBe('tool_result');
    expect(result.is_error).toBe(true);
    expect(result.content).toContain('exceptions');
  });

  it('최근 제안과 제목이 같으면 재시도 사유가 된다', async () => {
    const r = req({ framework: 'wpf', level: 'basic', recent: [{ title: '임시', layout: 'todo' }] });
    r.recent[0]!.title = exampleOf(pickLayout(r, () => 0)).title; // 고를 유형의 fixture 제목과 겹치게
    const call = fakeClaude((input, n) => (n === 1 ? input : { ...input, title: '새로운 업무 도구' }));
    const gen = createClaudeGenerator({ call, examples: drafts, log, random: () => 0 });
    const { assignment } = await gen(r);
    expect(assignment.title).toBe('새로운 업무 도구');
    expect(call.calls).toHaveLength(2);
  });

  it('두 번 모두 실패하면 422 INVALID_OUTPUT', async () => {
    const call = fakeClaude((input) => ({ ...input, requirements: [] }));
    const app = createApp(config, { generate: createClaudeGenerator({ call, examples: drafts, log }) });
    const res = await request(app).post('/api/assignments').send({ framework: 'react', level: 'intermediate' });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('INVALID_OUTPUT');
    expect(call.calls).toHaveLength(2);
  });

  it('Claude API 오류는 502 UPSTREAM_ERROR', async () => {
    const call: CallTool = async () => {
      throw new ClaudeApiError('Claude API 오류 529: Overloaded', 529);
    };
    const app = createApp(config, { generate: createClaudeGenerator({ call, examples: drafts, log }) });
    const res = await request(app).post('/api/assignments').send({ framework: 'node', level: 'basic' });
    expect(res.status).toBe(502);
    expect(res.body.code).toBe('UPSTREAM_ERROR');
  });

  it('API 경로로 정상 생성 (USE_MOCK=false 설정의 앱)', async () => {
    const app = createApp(config, { generate: createClaudeGenerator({ call: fakeClaude(), examples: drafts, log }) });
    const res = await request(app).post('/api/assignments').send({ framework: 'wpf', level: 'intermediate' });
    expect(res.status).toBe(200);
    expect(GenerateResponseSchema.parse(res.body).assignment.framework).toBe('wpf');
  });
});

describe('Claude 클라이언트 (fetch 요청 형식)', () => {
  it('도구 강제 사용으로 요청하고 tool_use를 꺼낸다', async () => {
    const fetchFn = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      expect(body.model).toBe('test-model');
      expect(body.tool_choice).toEqual({ type: 'tool', name: 't' });
      expect((init.headers as Record<string, string>)['x-api-key']).toBe('test-key');
      return new Response(JSON.stringify({ content: [{ type: 'tool_use', id: 'a', name: 't', input: { x: 1 } }], stop_reason: 'tool_use', usage: { input_tokens: 1, output_tokens: 2 } }));
    });
    const call = createClaudeClient(config, fetchFn as unknown as typeof fetch);
    const r = await call({ system: 's', messages: [{ role: 'user', content: 'hi' }], tool: { name: 't', description: 'd', input_schema: { type: 'object' } } });
    expect(r.toolUse).toEqual({ id: 'a', input: { x: 1 } });
    expect(fetchFn.mock.calls[0]![0]).toBe('https://api.anthropic.com/v1/messages');
  });

  it('오류 응답은 ClaudeApiError로 바꾼다', async () => {
    const fetchFn = async () => new Response(JSON.stringify({ error: { message: 'invalid x-api-key' } }), { status: 401 });
    const call = createClaudeClient(config, fetchFn as unknown as typeof fetch);
    await expect(call({ system: 's', messages: [], tool: { name: 't', description: 'd', input_schema: {} } })).rejects.toThrow(/401: invalid x-api-key/);
  });
});
