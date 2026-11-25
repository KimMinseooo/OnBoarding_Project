import { existsSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_WEB_DIST, createApp } from './app';
import { loadConfig } from './config';

const config = loadConfig();
createApp(config).listen(config.port, () => {
  const web = existsSync(path.join(DEFAULT_WEB_DIST, 'index.html'));
  console.log(`[server] http://localhost:${config.port} (mock=${config.useMock}, 화면=${web ? '빌드본 제공' : '없음 — 개발 중에는 Vite 사용'})`);
});
