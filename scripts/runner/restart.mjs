// 작업 실행기 재시작 도우미: node scripts/runner/restart.mjs <기존 실행기 pid>
// 맥 앞에 없을 때도 실행기를 새 코드로 다시 켤 수 있게 합니다.
// 1) 바로 분리된 자식으로 갈라져 나와 요청이 정상 종료되게 하고
// 2) 기존 실행기에 종료 신호를 보낸 뒤 3) 새 실행기를 창 없이(백그라운드) 켭니다. 출력: .runner/runner.log
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [oldPid, stage] = process.argv.slice(2);
if (!/^\d+$/.test(oldPid ?? '')) {
  console.error('사용: node scripts/runner/restart.mjs <기존 실행기 pid>');
  process.exit(2);
}

if (stage !== 'worker') {
  const p = spawn(process.execPath, [fileURLToPath(import.meta.url), oldPid, 'worker'], { cwd: ROOT, detached: true, stdio: 'ignore' });
  p.unref();
  console.log(`재시작 예약: 기존 실행기(pid ${oldPid})를 2초 뒤 종료하고 새 실행기를 켭니다`);
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
await sleep(2000); // 기존 실행기가 이 요청의 완료 표시를 남길 시간
const pid = Number(oldPid);
if (alive(pid)) process.kill(pid, 'SIGTERM');
for (let i = 0; i < 50 && alive(pid); i++) await sleep(100);
const log = fs.openSync(path.join(ROOT, '.runner', 'runner.log'), 'a');
const r = spawn(process.execPath, [path.join(ROOT, 'scripts/runner/runner.mjs')], { cwd: ROOT, detached: true, stdio: ['ignore', log, log] });
r.unref();
