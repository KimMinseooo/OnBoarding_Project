import { createApp } from './app';
import { loadConfig } from './config';
import { loadDrafts } from './mock/fixtures';

// Vercel 함수 진입점 — docs/03_architecture.md#vercel-배포
// scripts/vercel-build.mjs가 이 파일을 하나로 묶고, 같은 폴더에 fixtures/를 복사합니다.
// 화면(정적 파일)은 Vercel이 직접 제공하므로 여기서는 /api만 처리합니다.
// 환경 변수는 Vercel 프로젝트 설정에서 넣습니다 (기본 USE_MOCK=true → 비용 없음).

const app = createApp(loadConfig(), { drafts: loadDrafts(new URL('./fixtures/', import.meta.url)), webDist: null });
export default app;
