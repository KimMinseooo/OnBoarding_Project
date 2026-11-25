import type { Level } from '../schema/common';

// 산출물 — docs/05_assignment-rules.md#산출물
export const DELIVERABLES: Record<Level, string> = {
  basic: '실행 화면 캡처 + 소스 코드',
  intermediate: 'GitHub 저장소 + README + 시연 영상(3분)',
};
