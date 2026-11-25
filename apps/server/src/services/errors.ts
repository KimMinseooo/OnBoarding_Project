/** 생성 실패를 HTTP 응답으로 바꿀 때 쓰는 오류 — docs/03_architecture.md#서버-api */
export class GenerationError extends Error {
  constructor(
    readonly status: 422 | 502,
    readonly code: 'INVALID_OUTPUT' | 'UPSTREAM_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}
