import type { ProposalStatus } from '../../app/state';

// 버튼 공통 클래스 — 높이 44px 이상, 키보드 포커스 표시 (docs/02 접근성)
export const BTN =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-[14.5px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cobalt disabled:opacity-60';
export const BTN_OUTLINE = `${BTN} border border-gray-300 bg-white text-ink hover:bg-gray-50`;

/** 제안 상태 배지 [표시 이름, 클래스] — docs/02_ui-spec.md#제안-상태-흐름 */
export const STATUS_STYLE: Record<ProposalStatus, [string, string]> = {
  proposed: ['검토 중', 'text-cobalt bg-indigo-50 ring-indigo-200'],
  rejected: ['넘김', 'text-gray-500 bg-gray-100 ring-gray-200'],
  adopted: ['채택', 'text-emerald-700 bg-emerald-50 ring-emerald-200'],
};
