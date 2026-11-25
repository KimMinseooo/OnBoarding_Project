import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { FRAMEWORKS, GenerateResponseSchema, type GenerateRequest } from '@obp/shared';
import { createApp } from './app';
import { loadConfig } from './config';
import { loadDrafts } from './mock/fixtures';
import { createMockGenerator } from './services/generator';

const config = loadConfig({ USE_MOCK: 'true', PORT: '0' });
const app = createApp(config);
const post = (body: unknown) => request(app).post('/api/assignments').send(body as object);

describe('POST /api/assignments (Mock)', () => {
  it('첫 제안은 프레임워크의 첫 화면 유형이고 응답이 스키마를 통과한다', async () => {
    const res = await post({ framework: 'winform', level: 'basic', recent: [] });
    expect(res.status).toBe(200);
    const body = GenerateResponseSchema.parse(res.body);
    expect(body.assignment.framework).toBe('winform');
    expect(body.assignment.layout).toBe(FRAMEWORKS.winform.firstLayout.basic);
  });

  it('최근 제안과 겹치지 않고, 직전과 다른 화면 유형을 고른다', async () => {
    const first = GenerateResponseSchema.parse((await post({ framework: 'react', level: 'intermediate' })).body).assignment;
    for (let i = 0; i < 10; i++) {
      const res = await post({ framework: 'react', level: 'intermediate', recent: [{ title: first.title, layout: first.layout }] });
      const a = GenerateResponseSchema.parse(res.body).assignment;
      expect(a.title).not.toBe(first.title);
      expect(a.layout).not.toBe(first.layout);
    }
  });

  it('요청 형식이 틀리면 400', async () => {
    const res = await post({ framework: 'cobol', level: 'basic' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('BAD_REQUEST');
  });

  it('생성기가 없으면 501', async () => {
    const res = await request(createApp(config, { generate: null })).post('/api/assignments').send({ framework: 'wpf', level: 'basic' });
    expect(res.status).toBe(501);
  });
});

describe('Mock 생성기 규칙', () => {
  const drafts = loadDrafts();
  const gen = createMockGenerator(drafts, () => 0);

  it('같은 난이도 샘플을 모두 보면 안내와 함께 처음부터 다시 제안한다', async () => {
    const recent: GenerateRequest['recent'] = drafts.filter((d) => d.level === 'basic').map((d) => ({ title: d.title, layout: d.layout }));
    const res = await gen({ framework: 'wpf', level: 'basic', recent });
    expect(res.notice).toContain('모두 봤어요');
    expect(res.assignment.title).not.toBe(recent[0]!.title);
  });

  it('난이도별로 8개를 연속 제안하면 모두 다르다', async () => {
    for (const level of ['basic', 'intermediate'] as const) {
      const recent: GenerateRequest['recent'] = [];
      for (let i = 0; i < 8; i++) {
        const remaining = drafts.filter((d) => d.level === level && !recent.some((r) => r.title === d.title));
        const canDiffer = remaining.some((d) => d.layout !== recent[0]?.layout);
        const { assignment: a } = await createMockGenerator(drafts)({ framework: 'python', level, recent });
        expect(recent.map((r) => r.title)).not.toContain(a.title);
        if (recent[0] && canDiffer) expect(a.layout).not.toBe(recent[0].layout);
        recent.unshift({ title: a.title, layout: a.layout });
      }
    }
  });
});
