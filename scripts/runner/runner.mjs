// 작업 실행기: .runner/inbox/*.json 요청을 읽어 tasks.mjs의 허용된 작업만 실행합니다.
// 결과: .runner/out/<id>.log (출력), .runner/out/<id>.done (종료 코드)
// 셸을 거치지 않고(spawn 인자 배열) 실행하므로 요청 내용이 명령어로 해석되지 않습니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = path.join(ROOT, '.runner');
const INBOX = path.join(DIR, 'inbox');
const OUT = path.join(DIR, 'out');
fs.mkdirSync(INBOX, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });
// 이전에 처리한 요청 흔적 정리
for (const f of fs.readdirSync(INBOX)) if (f.endsWith('.handled')) fs.rmSync(path.join(INBOX, f), { force: true });

const bg = new Map(); // 백그라운드 프로세스 (개발 서버)
let busy = '';
const now = () => new Date().toLocaleTimeString('ko-KR');

setInterval(() => {
  fs.writeFileSync(path.join(DIR, 'heartbeat'), JSON.stringify({ pid: process.pid, at: Date.now(), busy, bg: [...bg.keys()] }));
}, 1000);

async function loop() {
  try {
    const files = fs.readdirSync(INBOX).filter((f) => f.endsWith('.json')).sort();
    if (files.length) {
      const exe = path.join(ROOT, 'scripts/runner/executor.mjs');
      const { handle } = await import(`${pathToFileURL(exe).href}?t=${fs.statSync(exe).mtimeMs}`);
      await handle(files[0], { ROOT, INBOX, OUT, bg, now, setBusy: (b) => { busy = b; } });
    }
  } catch (e) {
    console.error(e);
  }
  setTimeout(loop, 500);
}

const shutdown = () => { for (const p of bg.values()) { try { process.kill(-p.pid, 'SIGTERM'); } catch { /* 이미 종료됨 */ } } process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);

console.log(`[${now()}] 작업 실행기 시작 — ${ROOT}`);
console.log('허용된 작업 목록: scripts/runner/tasks.mjs (수정하면 다음 요청부터 바로 반영)');
console.log('이 창을 닫으면 실행기와 실행기가 켠 개발 서버가 함께 종료됩니다.\n');
loop();
