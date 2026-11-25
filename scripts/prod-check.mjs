// 배포 모드 점검: 빌드된 화면 + API를 서버 하나로 띄워(포트 3100) 응답을 확인하고 종료합니다.
// 실행: npm run build 후 node scripts/prod-check.mjs — docs/03_architecture.md#배포
import { spawn } from 'node:child_process';

const PORT = '3100';
const base = `http://localhost:${PORT}`;
const server = spawn('npm', ['run', 'start', '-w', '@obp/server'], { env: { ...process.env, PORT, USE_MOCK: 'true' }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
server.stdout.on('data', (d) => process.stdout.write(d));
server.stderr.on('data', (d) => process.stdout.write(d));
const stop = () => {
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch {
    /* 이미 종료 */
  }
};

let code = 1;
try {
  let up = false;
  for (let i = 0; i < 30 && !up; i++) {
    await new Promise((r) => setTimeout(r, 500));
    up = await fetch(`${base}/api/health`).then((r) => r.ok, () => false);
  }
  if (!up) throw new Error('서버가 15초 안에 뜨지 않았습니다');
  const page = await fetch(`${base}/`).then((r) => r.text());
  if (!page.includes('<div id="root">')) throw new Error('첫 화면(index.html)을 받지 못했습니다 — npm run build를 먼저 실행하세요');
  const asset = page.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
  const js = asset ? await fetch(base + asset) : null;
  if (!js?.ok) throw new Error(`화면 스크립트를 받지 못했습니다 (${asset})`);
  const gen = await fetch(`${base}/api/assignments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ framework: 'python', level: 'intermediate' }) });
  const body = await gen.json();
  if (!gen.ok) throw new Error(`과제 생성 실패 ${gen.status}`);
  console.log(`✓ 첫 화면 ${page.length}B · 스크립트 ${asset} · 생성 "${body.assignment.title}" (${body.assignment.layout})`);
  code = 0;
} catch (e) {
  console.log(`✗ ${e.message}`);
} finally {
  stop();
}
process.exit(code);
