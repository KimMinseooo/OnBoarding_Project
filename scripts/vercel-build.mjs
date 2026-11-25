// Vercel 빌드: 웹 정적 파일 + /api 함수를 Build Output API(v3) 형식으로 만듭니다.
// Vercel이 "npm run vercel-build" 후 .vercel/output을 그대로 배포합니다 — docs/03_architecture.md#vercel-배포
import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '.vercel/output');
const FN = path.join(OUT, 'functions/api.func');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(FN, { recursive: true });

// 1) 화면: npm run build 결과(apps/web/dist)를 정적 파일로
cpSync(path.join(ROOT, 'apps/web/dist'), path.join(OUT, 'static'), { recursive: true });

// 2) API: Express 앱을 파일 하나로 묶기 (공유 패키지 TS 포함)
await build({
  entryPoints: [path.join(ROOT, 'apps/server/src/vercel.ts')],
  outfile: path.join(FN, 'index.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  // CommonJS 라이브러리(express 등)가 require를 쓸 수 있게
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  logLevel: 'warning',
});
cpSync(path.join(ROOT, 'fixtures'), path.join(FN, 'fixtures'), { recursive: true });
writeFileSync(
  path.join(FN, '.vc-config.json'),
  JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: false, maxDuration: 60 }, null, 2),
);

// 3) 경로: /api/* → 함수, 정적 파일, 나머지 화면 주소는 index.html
writeFileSync(
  path.join(OUT, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '^/assets/(.*)$', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
        { src: '^/api(/.*)?$', dest: '/api' },
        { handle: 'filesystem' },
        { src: '^/(.*)$', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
);
console.log('✓ .vercel/output 생성 (static + functions/api.func)');
