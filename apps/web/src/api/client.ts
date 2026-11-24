import { API_PATHS, ApiErrorSchema, HealthResponseSchema, type HealthResponse } from '@obp/shared';

/** 서버 응답을 공유 스키마로 검증합니다. 형식이 다르면 오류를 던집니다. */
async function getJson<T>(path: string, parse: (data: unknown) => T): Promise<T> {
  const res = await fetch(path);
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = ApiErrorSchema.safeParse(data);
    throw new Error(err.success ? err.data.message : `요청 실패 (${res.status})`);
  }
  return parse(data);
}

export function fetchHealth(): Promise<HealthResponse> {
  return getJson(API_PATHS.health, (d) => HealthResponseSchema.parse(d));
}
