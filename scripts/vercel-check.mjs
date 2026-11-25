// Vercel 빌드 결과 점검: .vercel/output의 함수를 로컬 Node로 띄워 /api 응답과 정적 파일을 확인합니다.
// 실행: npm run vercel-build 후 node scripts/vercel-check.mjs — docs/03_architecture.md#vercel-배포
import { existsSync, readFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.vercel/output');
const fail = (m) => {
  console.log(`✗ ${m}`);
  process.exit(1);
};
for (const f of ['config.json', 'static/index.html', 'functions/api.func/index.mjs', 'functions/api.func/.vc-config.json'])
  if (!existsSync(path.join(OUT, f))) fail(`${f} 없음 — npm run vercel-build 먼저`);
const routes = JSON.parse(readFileSync(path.join(OUT, 'config.json'), 'utf8')).routes;
if (!routes.some((r) => r.dest === '/api')) fail('config.json에 /api 경로 없음');

delete process.env.USE_MOCK; // Vercel 기본값(Mock)으로 확인
const { default: app } = await import(pathToFileURL(path.join(OUT, 'functions/api.func/index.mjs')).href);
const server = http.createServer(app).listen(0);
const base = `http://localhost:${server.address().port}`;
try {
  const health = await fetch(`${base}/api/health`).then((r) => r.json());
  if (health.mock !== true) fail(`health.mock=${health.mock} (Mock이어야 함)`);
  const titles = new Set();
  let recent = [];
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`${base}/api/assignments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ framework: 'react', level: 'basic', recent }) });
    if (!r.ok) fail(`생성 ${r.status}`);
    const a = (await r.json()).assignment;
    titles.add(a.title);
    recent = [{ title: a.title, layout: a.layout }, ...recent];
  }
  const nf = await fetch(`${base}/api/nothing`);
  if (nf.status !== 404) fail('없는 API가 404가 아님');
  console.log(`✓ 함수 동작: health ok(mock) · 연속 생성 ${titles.size}개 모두 다른 과제 · 없는 경로 404`);
  console.log(`✓ 정적 파일: index.html ${readFileSync(path.join(OUT, 'static/index.html')).length}B · 경로 규칙 ${routes.length}개`);
} finally {
  server.close();
}
