// 작업 실행기: .runner/inbox/*.json 요청을 읽어 tasks.mjs의 허용된 작업만 실행합니다.
// 결과: .runner/out/<id>.log (출력), .runner/out/<id>.done (종료 코드)
// 셸을 거치지 않고(spawn 인자 배열) 실행하므로 요청 내용이 명령어로 해석되지 않습니다.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TASKS } from './tasks.mjs';

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

async function isUp(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
}

function run(step, log) {
  return new Promise((resolve) => {
    log(`$ ${step.cmd} ${step.args.join(' ')}`);
    const p = spawn(step.cmd, step.args, { cwd: ROOT, env: { ...process.env, FORCE_COLOR: '0' } });
    p.stdout.on('data', (d) => log(String(d), true));
    p.stderr.on('data', (d) => log(String(d), true));
    p.on('error', (e) => { log(`실행 오류: ${e.message}`); resolve(1); });
    p.on('close', (code) => resolve(code ?? 1));
  });
}

async function handle(file) {
  const full = path.join(INBOX, file);
  let req;
  try { req = JSON.parse(fs.readFileSync(full, 'utf8')); } catch { req = {}; }
  // 처리한 요청은 지우고, 삭제가 막힌 환경이면 이름을 바꿔 다시 실행되지 않게 합니다
  try { fs.rmSync(full, { force: true }); } catch { fs.renameSync(full, `${full}.handled`); }
  const id = /^[\w-]{1,60}$/.test(req.id ?? '') ? req.id : `bad-${Date.now()}`;
  const logFile = path.join(OUT, `${id}.log`);
  const log = (msg, raw = false) => {
    const text = raw ? msg : `${msg}\n`;
    fs.appendFileSync(logFile, text);
    process.stdout.write(raw ? text : `[${now()}] ${text}`);
  };
  const started = Date.now();
  let code = 0;
  busy = req.task ?? '';
  log(`▶ 작업: ${req.task} ${req.args ? JSON.stringify(req.args) : ''}`);
  try {
    const task = TASKS[req.task];
    if (!task) throw new Error(`허용되지 않은 작업입니다: ${req.task}`);
    for (const step of task.steps(req.args)) {
      if (step.skipIfUp) {
        if (await isUp(step.skipIfUp)) { log('이미 실행 중입니다 (건너뜀)'); break; }
      } else if (step.bg) {
        const out = fs.openSync(path.join(OUT, `${step.bg}.log`), 'a');
        const p = spawn(step.cmd, step.args, { cwd: ROOT, detached: true, stdio: ['ignore', out, out] });
        bg.set(step.bg, p);
        p.on('close', () => bg.delete(step.bg));
        log(`백그라운드 시작: ${step.bg} (pid ${p.pid}, 출력 .runner/out/${step.bg}.log)`);
      } else if (step.stop) {
        const p = bg.get(step.stop);
        if (p) { process.kill(-p.pid, 'SIGTERM'); log(`종료: ${step.stop}`); } else log(`실행기가 켠 ${step.stop}가 없습니다`);
      } else if (step.wait) {
        const until = Date.now() + step.timeout * 1000;
        let ok = false;
        while (Date.now() < until) { if ((ok = await isUp(step.wait))) break; await new Promise((r) => setTimeout(r, 1000)); }
        log(ok ? `응답 확인: ${step.wait}` : `응답 없음: ${step.wait}`);
        if (!ok) { code = 1; break; }
      } else {
        const c = await run(step, log);
        if (c !== 0 && !step.allowFail) { code = c; break; }
        if (c !== 0) log(`(종료 코드 ${c}, 이 작업에서는 정상 범위)`);
      }
    }
  } catch (e) {
    log(`오류: ${e.message}`);
    code = 2;
  }
  log(`${code === 0 ? '✅ 완료' : '❌ 실패'} (${((Date.now() - started) / 1000).toFixed(1)}초)`);
  fs.writeFileSync(path.join(OUT, `${id}.done`), JSON.stringify({ id, task: req.task, code, started, ended: Date.now() }));
  busy = '';
}

async function loop() {
  try {
    const files = fs.readdirSync(INBOX).filter((f) => f.endsWith('.json')).sort();
    if (files.length) await handle(files[0]);
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
console.log(`허용된 작업: ${Object.keys(TASKS).join(', ')}`);
console.log('이 창을 닫으면 실행기와 실행기가 켠 개발 서버가 함께 종료됩니다.\n');
loop();
