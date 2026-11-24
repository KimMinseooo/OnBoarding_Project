import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { ApiErrorSchema, HealthResponseSchema } from '@obp/shared';
import { createApp } from './app';
import { loadConfig } from './config';

const app = createApp(loadConfig({ USE_MOCK: 'true', PORT: '0' }));

describe('GET /api/health', () => {
  it('공유 스키마에 맞는 응답을 돌려준다', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    const body = HealthResponseSchema.parse(res.body);
    expect(body).toMatchObject({ ok: true, mock: true });
  });
});

describe('없는 API', () => {
  it('404와 { code, message } 형식으로 응답한다', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(ApiErrorSchema.parse(res.body).code).toBe('NOT_FOUND');
  });
});

describe('loadConfig', () => {
  it('USE_MOCK=false인데 키가 없으면 시작하지 않는다', () => {
    expect(() => loadConfig({ USE_MOCK: 'false' })).toThrow();
  });
});
