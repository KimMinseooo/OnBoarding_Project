import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';
import { loadConfig } from './config';

// 배포 모드: 서버 하나로 빌드된 화면 + API 제공 — docs/03_architecture.md#배포
const dist = mkdtempSync(path.join(tmpdir(), 'obp-web-'));
writeFileSync(path.join(dist, 'index.html'), '<!doctype html><title>onboarding</title>');
writeFileSync(path.join(dist, 'app.js'), 'console.log(1)');
const app = createApp(loadConfig({ USE_MOCK: 'true', PORT: '0' }), { webDist: dist });

describe('빌드된 화면 제공', () => {
  it('첫 화면과 정적 파일을 돌려준다', async () => {
    expect((await request(app).get('/')).text).toContain('onboarding');
    expect((await request(app).get('/app.js')).text).toContain('console.log');
  });
  it('화면 주소는 index.html로, API 주소는 그대로', async () => {
    expect((await request(app).get('/some/page')).text).toContain('onboarding');
    const api = await request(app).get('/api/nothing');
    expect(api.status).toBe(404);
    expect(api.body.code).toBe('NOT_FOUND');
    expect((await request(app).get('/api/health')).body.mock).toBe(true);
  });
  it('빌드본이 없으면 화면을 제공하지 않는다', async () => {
    const res = await request(createApp(loadConfig({ USE_MOCK: 'true', PORT: '0' }), { webDist: null })).get('/');
    expect(res.status).toBe(404);
  });
});
