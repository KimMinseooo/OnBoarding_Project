import { readFileSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';

// 저장소 루트의 .env를 읽습니다. 항목 설명: docs/03_architecture.md#환경-변수-envexample
loadEnv({ path: new URL('../../../.env', import.meta.url) });

export type AppConfig = {
  port: number;
  useMock: boolean;
  anthropicApiKey: string;
  anthropicModel: string;
  version: string;
};

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

/** 환경 변수를 읽어 설정 객체를 만듭니다. USE_MOCK은 값이 없으면 true(키 없이도 동작). */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const useMock = (env.USE_MOCK ?? 'true').toLowerCase() !== 'false';
  const config: AppConfig = {
    port: Number(env.PORT ?? 3001),
    useMock,
    anthropicApiKey: env.ANTHROPIC_API_KEY ?? '',
    anthropicModel: env.ANTHROPIC_MODEL ?? '',
    version: pkg.version,
  };
  if (!useMock && (!config.anthropicApiKey || !config.anthropicModel)) {
    throw new Error('USE_MOCK=false이면 ANTHROPIC_API_KEY와 ANTHROPIC_MODEL이 필요합니다 (.env 확인)');
  }
  return config;
}
