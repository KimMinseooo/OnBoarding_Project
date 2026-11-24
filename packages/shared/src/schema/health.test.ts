import { describe, expect, it } from 'vitest';
import { ApiErrorSchema, HealthResponseSchema } from './health';

describe('HealthResponseSchema', () => {
  it('정상 응답을 통과시킨다', () => {
    expect(HealthResponseSchema.parse({ ok: true, mock: true, version: '0.1.0' })).toEqual({
      ok: true,
      mock: true,
      version: '0.1.0',
    });
  });

  it('필드가 빠지면 거부한다', () => {
    expect(HealthResponseSchema.safeParse({ ok: true }).success).toBe(false);
  });
});

describe('ApiErrorSchema', () => {
  it('{ code, message } 형식을 검증한다', () => {
    expect(ApiErrorSchema.safeParse({ code: 'NOT_FOUND', message: '없음' }).success).toBe(true);
  });
});
