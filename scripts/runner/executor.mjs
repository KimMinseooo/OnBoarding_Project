// 요청 하나를 실행하는 부분. 실행기가 요청마다 이 파일을 새로 불러오므로,
// 이 파일과 tasks.mjs를 고치면 실행기를 다시 켜지 않아도 바로 반영됩니다.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function isUp(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
}

function run(step, log, root) {
  return new Promise((resolve) => {
    log(`$ ${step.cmd} ${step.args.join(' ')}`);
    const p = spawn(step.cmd, step.args, { cwd: root, env: { ...process.env, FORCE_COLOR: '0' } });
    p.stdout.on('data', (d) => log(String(d), true));
    p.stderr.on('data', (d) => log(String(d), true));
    p.on('error', (e) => { log(`실행 오류: ${e.message}`); resolve(1); });
    p.on('close', (code) => resolve(code ?? 1));
  });
}

export async function handle(file, { ROOT, INBOX, OUT, bg, setBusy, now }) {
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
  setBusy(req.task ?? '');
  log(`▶ 작업: ${req.task} ${req.args ? JSON.stringify(req.args) : ''}`);
  try {
    const { TASKS } = await import(`${pathToFileURL(path.join(ROOT, 'scripts/runner/tasks.mjs')).href}?t=${Date.now()}`);
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
      } else if (step.post || step.get) {
        const url = step.post ?? step.get;
        const init = step.post ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(step.body) } : {};
        try {
          const r = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) });
          const text = await r.text();
          let summary = text.slice(0, 200);
          try {
            const j = JSON.parse(text);
            const a = j.assignment;
            summary = a ? `${a.framework}/${a.level}/${a.layout} "${a.title}" 요구사항 ${a.requirements.length}개, 채점표 ${a.rubric.length}그룹` : JSON.stringify(j).slice(0, 200);
          } catch { /* HTML 등 */ }
          log(`${step.post ? 'POST' : 'GET'} ${url} → ${r.status} ${summary.replace(/\s+/g, ' ')}`);
          if (!r.ok) { code = 1; break; }
        } catch (e) { log(`요청 실패: ${e.message}`); code = 1; break; }
      } else if (step.wait) {
        const until = Date.now() + step.timeout * 1000;
        let ok = false;
        while (Date.now() < until) { if ((ok = await isUp(step.wait))) break; await new Promise((r) => setTimeout(r, 1000)); }
        log(ok ? `응답 확인: ${step.wait}` : `응답 없음: ${step.wait}`);
        if (!ok) { code = 1; break; }
      } else {
        const c = await run(step, log, ROOT);
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
  setBusy('');
}

