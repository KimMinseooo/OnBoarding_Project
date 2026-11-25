import { readFileSync, readdirSync } from 'node:fs';
import { AssignmentDraftSchema, type AssignmentDraft } from '@obp/shared';

// 저장소 루트 fixtures/*.json (Draft 형식) — docs/04_assignment-schema.md
const DIR = new URL('../../../../fixtures/', import.meta.url);

/** 서버 시작 시 한 번 읽고, 형식이 틀린 파일이 있으면 파일 이름과 함께 시작을 막습니다. */
export function loadDrafts(dir: URL = DIR): AssignmentDraft[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => {
      const r = AssignmentDraftSchema.safeParse(JSON.parse(readFileSync(new URL(file, dir), 'utf8')));
      if (!r.success) throw new Error(`fixtures/${file} 형식 오류: ${r.error.issues.map((i) => i.message).join(', ')}`);
      return r.data;
    });
}
