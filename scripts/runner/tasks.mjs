// 작업 실행기가 실행할 수 있는 작업 목록 (허용 목록).
// 여기에 없는 작업은 실행하지 않습니다. 작업을 추가하면 CLAUDE.md "터미널 작업 실행" 표도 갱신합니다.

const WORKSPACES = ['@obp/web', '@obp/server', '@obp/shared'];
// npm 패키지 이름(+선택 버전) 형식만 허용 — 셸 문자가 끼어들 수 없게
const PKG = /^(@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*(@[a-zA-Z0-9.^~<>=*|-]+)?$/;
const DEV_URL = 'http://localhost:5173/api/health';

const npm = (...args) => ({ cmd: 'npm', args });
const git = (...args) => ({ cmd: 'git', args });

function checkWorkspace(ws) {
  if (!WORKSPACES.includes(ws)) throw new Error(`workspace는 ${WORKSPACES.join(', ')} 중 하나여야 합니다`);
}
function checkPackages(pkgs) {
  if (!Array.isArray(pkgs) || pkgs.length === 0 || pkgs.length > 10) throw new Error('packages는 1~10개 배열이어야 합니다');
  for (const p of pkgs) if (typeof p !== 'string' || !PKG.test(p)) throw new Error(`허용되지 않는 패키지 이름: ${p}`);
}

export const TASKS = {
  install: { desc: '의존성 설치 (npm install)', steps: () => [npm('install')] },
  typecheck: { desc: '전체 타입 검사', steps: () => [npm('run', 'typecheck')] },
  lint: { desc: 'ESLint', steps: () => [npm('run', 'lint')] },
  'lint-fix': { desc: 'ESLint 자동 수정', steps: () => [npm('run', 'lint', '--', '--fix')] },
  format: { desc: 'Prettier 정리', steps: () => [npm('run', 'format')] },
  test: { desc: '전체 테스트', steps: () => [npm('test')] },
  build: { desc: '웹 빌드', steps: () => [npm('run', 'build')] },
  verify: {
    desc: '타입 검사 → 린트 → 테스트 (작업 마무리 확인)',
    steps: () => [npm('run', 'typecheck'), npm('run', 'lint'), npm('test')],
  },
  audit: { desc: '보안 취약점 점검', steps: () => [{ ...npm('audit'), allowFail: true }] },
  'audit-fix': { desc: '호환되는 범위에서 취약점 수정 (--force 없음)', steps: () => [{ ...npm('audit', 'fix'), allowFail: true }] },
  outdated: { desc: '새 버전 확인', steps: () => [{ ...npm('outdated'), allowFail: true }] },
  add: {
    desc: '패키지 추가 { workspace, packages[], dev? }',
    steps: ({ workspace, packages, dev } = {}) => {
      checkWorkspace(workspace);
      checkPackages(packages);
      return [npm('install', ...(dev ? ['-D'] : []), '-w', workspace, ...packages)];
    },
  },
  remove: {
    desc: '패키지 제거 { workspace, packages[] }',
    steps: ({ workspace, packages } = {}) => {
      checkWorkspace(workspace);
      checkPackages(packages);
      return [npm('uninstall', '-w', workspace, ...packages)];
    },
  },
  'dev-start': {
    desc: '개발 서버 켜기 (이미 켜져 있으면 그대로)',
    steps: () => [{ skipIfUp: DEV_URL }, { bg: 'dev', cmd: 'npm', args: ['run', 'dev'] }, { wait: DEV_URL, timeout: 60 }],
  },
  'dev-stop': { desc: '실행기가 켠 개발 서버 끄기', steps: () => [{ stop: 'dev' }] },
  health: { desc: '개발 서버 응답 확인', steps: () => [{ wait: DEV_URL, timeout: 5 }] },
  'api-check': {
    desc: '과제 생성 API에 고정된 샘플 요청 보내기 (Mock)',
    steps: () => [
      { wait: DEV_URL, timeout: 10 },
      { post: 'http://localhost:5173/api/assignments', body: { framework: 'wpf', level: 'basic', recent: [] } },
      { post: 'http://localhost:5173/api/assignments', body: { framework: 'react', level: 'intermediate', recent: [] } },
      { get: 'http://localhost:5173/' },
    ],
  },
  'claude-check': {
    desc: '실제 Claude API로 5종×2난이도×회수 생성 점검 { rounds?: 1~3, framework? } (비용 발생)',
    steps: ({ rounds = 3, framework } = {}) => {
      if (![1, 2, 3].includes(rounds)) throw new Error('rounds는 1~3');
      if (framework !== undefined && !['wpf', 'winform', 'react', 'python', 'node'].includes(framework)) throw new Error('framework 값 오류');
      return [npm('run', 'claude-check', '-w', '@obp/server', '--', String(rounds), ...(framework ? [framework] : []))];
    },
  },
  'prod-check': {
    desc: '배포 모드 점검: 웹 빌드 → 서버 하나로 화면+API(포트 3100) 응답 확인 후 종료',
    steps: () => [npm('run', 'build'), { cmd: 'node', args: ['scripts/prod-check.mjs'] }],
  },
  'runner-restart': {
    desc: '실행기를 새 코드로 다시 켜기 (창 없이 백그라운드, 출력 .runner/runner.log)',
    steps: () => [{ cmd: 'node', args: ['scripts/runner/restart.mjs', String(process.pid)] }],
  },
  'git-status': { desc: 'Git 상태', steps: () => [git('status', '--short', '--branch')] },
  'git-log': { desc: '최근 커밋 15개', steps: () => [git('log', '--oneline', '-15')] },
  'git-diff': { desc: '변경 파일 요약', steps: () => [git('diff', '--stat'), git('diff', '--cached', '--stat')] },
  'git-commit': {
    desc: '전체 변경 커밋 { message }',
    steps: ({ message } = {}) => {
      if (typeof message !== 'string' || !message.trim() || message.length > 300) throw new Error('message는 1~300자 문자열이어야 합니다');
      return [git('add', '-A'), git('commit', '-m', message)];
    },
  },
};
