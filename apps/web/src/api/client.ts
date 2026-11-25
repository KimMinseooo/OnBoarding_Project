import {
  API_PATHS,
  ApiErrorSchema,
  GenerateResponseSchema,
  HealthResponseSchema,
  type GenerateRequest,
  type GenerateResponse,
  type HealthResponse,
} from '@obp/shared';

/** 서버 응답을 공유 스키마로 검증합니다. 형식이 다르면 오류를 던집니다. */
async function request<T>(path: string, parse: (data: unknown) => T, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = ApiErrorSchema.safeParse(data);
    throw new Error(err.success ? err.data.message : `요청 실패 (${res.status})`);
  }
  return parse(data);
}

export function fetchHealth(): Promise<HealthResponse> {
  return request(API_PATHS.health, (d) => HealthResponseSchema.parse(d));
}

export function generateAssignment(body: GenerateRequest): Promise<GenerateResponse> {
  return request(API_PATHS.assignments, (d) => GenerateResponseSchema.parse(d), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
