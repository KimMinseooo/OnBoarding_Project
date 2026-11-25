// 5단계 완료 기준 점검 — docs/00_roadmap.md#5단계-claude-api-연동
// 프레임워크 5종 × 난이도 2종 × N회 실제 생성 → 검증 실패율·생성 시간 요약
// 결과물은 .runner/out/claude-check/에 저장 (7단계 품질 점검에 사용)
// 실행: npm run claude-check -w @obp/server -- [회수=3] [프레임워크]
import { mkdirSync, writeFileSync } from 'node:fs';
import { FRAMEWORK_IDS, LEVELS, type FrameworkId, type GenerateRequest } from '@obp/shared';
import { createClaudeClient } from '../src/claude/client';
import { loadConfig } from '../src/config';
import { loadDrafts } from '../src/mock/fixtures';
import { createClaudeGenerator } from '../src/services/claudeGenerator';
import { GenerationError } from '../src/services/errors';

const rounds = Math.min(Math.max(Number(process.argv[2] ?? 3) || 3, 1), 3);
const only = process.argv[3] as FrameworkId | undefined;
if (only && !FRAMEWORK_IDS.includes(only)) throw new Error(`프레임워크는 ${FRAMEWORK_IDS.join(', ')} 중 하나`);

const config = loadConfig({ ...process.env, USE_MOCK: 'false' });
const outDir = new URL('../../../.runner/out/claude-check/', import.meta.url);
mkdirSync(outDir, { recursive: true });

let attempts = 0;
const logs: string[] = [];
const generate = createClaudeGenerator({
  call: createClaudeClient(config),
  examples: loadDrafts(),
  log: (m) => {
    logs.push(m);
    attempts++;
    console.log(m);
  },
});

type Row = { fw: string; level: string; ok: boolean; secs: number; retried: boolean; title?: string; error?: string };
const rows: Row[] = [];
for (const fw of only ? [only] : FRAMEWORK_IDS) {
  for (const level of LEVELS) {
    const recent: GenerateRequest['recent'] = [];
    for (let i = 0; i < rounds; i++) {
      const before = attempts;
      const t = Date.now();
      try {
        const { assignment: a } = await generate({ framework: fw, level, recent: [...recent] });
        recent.unshift({ title: a.title, layout: a.layout });
        writeFileSync(new URL(`${a.id}.json`, outDir), JSON.stringify(a, null, 2));
        rows.push({ fw, level, ok: true, secs: (Date.now() - t) / 1000, retried: attempts - before > 1, title: `${a.title} (${a.layout})` });
      } catch (e) {
        const msg = e instanceof GenerationError ? `${e.code} ${e.message}` : String(e);
        rows.push({ fw, level, ok: false, secs: (Date.now() - t) / 1000, retried: true, error: msg });
        console.log(`  ✗ ${msg}`);
        if (e instanceof GenerationError && e.code === 'UPSTREAM_ERROR' && /401|403|연결하지/.test(e.message)) {
          console.log('API 키·네트워크 문제로 보여 점검을 멈춥니다.');
          i = rounds;
        }
      }
    }
  }
}

const fail = rows.filter((r) => !r.ok).length;
const secs = rows.filter((r) => r.ok).map((r) => r.secs).sort((a, b) => a - b);
const p = (q: number) => (secs.length ? secs[Math.min(secs.length - 1, Math.floor(q * secs.length))]!.toFixed(1) : '-');
const summary = [
  '',
  '===== 5단계 점검 요약 =====',
  `생성 ${rows.length}회 · 성공 ${rows.length - fail} · 최종 실패 ${fail} (${((fail / Math.max(rows.length, 1)) * 100).toFixed(1)}%, 기준 5% 미만)`,
  `재시도 발생 ${rows.filter((r) => r.retried && r.ok).length}회`,
  `생성 시간(성공 기준) 중앙값 ${p(0.5)}초 · 90% ${p(0.9)}초 · 최대 ${secs.length ? secs.at(-1)!.toFixed(1) : '-'}초 (기준 30초 이내)`,
  ...rows.map((r) => `${r.ok ? '✓' : '✗'} ${r.fw}/${r.level} ${r.secs.toFixed(1)}초${r.retried && r.ok ? ' (재시도)' : ''} ${r.title ?? r.error}`),
];
console.log(summary.join('\n'));
writeFileSync(new URL('summary.txt', outDir), [...logs, ...summary].join('\n'));
process.exit(fail / Math.max(rows.length, 1) < 0.05 ? 0 : 1);
