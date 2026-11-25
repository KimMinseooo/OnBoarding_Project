import {
  FRAMEWORKS,
  LEVEL_LABEL,
  composeAssignment,
  type AssignmentDraft,
  type GenerateRequest,
  type GenerateResponse,
} from '@obp/shared';

export type Generator = (req: GenerateRequest) => Promise<GenerateResponse>;

/**
 * Mock 생성기: fixtures에서 Draft를 골라 조립합니다.
 * 고르는 규칙은 docs/05_assignment-rules.md#아이디어-제안-규칙
 */
export function createMockGenerator(drafts: AssignmentDraft[], random: () => number = Math.random): Generator {
  return async ({ framework, level, recent }) => {
    const pool = drafts.filter((d) => d.level === level);
    if (pool.length === 0) throw new Error(`${level} 샘플이 없습니다`);
    const seen = new Set(recent.map((r) => r.title));
    const last = recent[0];

    let candidates = pool.filter((d) => !seen.has(d.title));
    let notice: string | undefined;
    if (candidates.length === 0) {
      candidates = pool.filter((d) => d.title !== last?.title);
      notice = `준비된 ${LEVEL_LABEL[level]} 샘플 ${pool.length}개를 모두 봤어요. 처음부터 다시 보여 드려요.`;
    }

    // 첫 제안은 프레임워크의 첫 화면 유형, 이후에는 직전과 다른 화면 유형
    let pick = recent.length === 0 ? candidates.find((d) => d.layout === FRAMEWORKS[framework].firstLayout[level]) : undefined;
    if (!pick) {
      const differ = candidates.filter((d) => d.layout !== last?.layout);
      const list = differ.length ? differ : candidates;
      pick = list[Math.floor(random() * list.length)]!;
    }
    const id = `${pick.id ?? pick.entity.slug}-${framework}-${Date.now().toString(36)}`;
    return { assignment: composeAssignment(pick, framework, id), notice };
  };
}
