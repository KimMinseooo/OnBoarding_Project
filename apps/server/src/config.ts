import { readFileSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';

// 저장소 루트의 .env를 읽습니다. 항목 설명: docs/03_architecture.md#환경-변수-envexample
loadEnv({ path: new URL('../../../.env', import.meta.url) });

export type AppConfig = {
  port: number;
  useMock: boolean;
  anthropicApiKey: string;
  anthropicModel: string;
  /** 사내 게이트웨이·프록시를 거칠 때 바꿈 (기본: 공식 주소) */
  anthropicBaseUrl: string;
  /** Claude 호출 1회 제한 시간(ms) */
  anthropicTimeoutMs: number;
  version: string;
};

/** 서버 package.json의 버전 (Vercel처럼 하나의 파일로 묶여 실행되면 파일이 없으므로 APP_VERSION 또는 기본값) */
function readVersion(): string {
  try {
    return (JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }).version;
  } catch {
    return process.env.APP_VERSION ?? '0.1.0';
  }
}
const pkg = { version: readVersion() };

/** 환경 변수를 읽어 설정 객체를 만듭니다. USE_MOCK은 값이 없으면 true(키 없이도 동작). */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const useMock = (env.USE_MOCK ?? 'true').toLowerCase() !== 'false';
  const config: AppConfig = {
    port: Number(env.PORT ?? 3001),
    useMock,
    anthropicApiKey: env.ANTHROPIC_API_KEY ?? '',
    anthropicModel: env.ANTHROPIC_MODEL ?? '',
    anthropicBaseUrl: (env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, ''),
    anthropicTimeoutMs: Number(env.ANTHROPIC_TIMEOUT_MS || 60000),
    version: pkg.version,
  };
  if (!useMock && (!config.anthropicApiKey || !config.anthropicModel)) {
    throw new Error('USE_MOCK=false이면 ANTHROPIC_API_KEY와 ANTHROPIC_MODEL이 필요합니다 (.env 확인)');
  }
  return config;
}
