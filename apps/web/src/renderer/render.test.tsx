import { readFileSync, readdirSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AssignmentDraftSchema, FRAMEWORK_IDS, composeAssignment, type FrameworkId } from '@obp/shared';
import { renderMockup } from './frame';

// 36개 fixture × 프레임워크 5종 = 180개 조합, 선택 위치 0~6까지 모두 그려 봅니다 (docs/00 4단계 완료 기준)
const DIR = new URL('../../../../fixtures/', import.meta.url);
const drafts = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => AssignmentDraftSchema.parse(JSON.parse(readFileSync(new URL(f, DIR), 'utf8'))));
const combos = drafts.flatMap((d) => FRAMEWORK_IDS.map((fw) => [d.id!, fw] as [string, FrameworkId]));

describe('예시 화면 렌더러', () => {
  it('180개 조합', () => expect(combos).toHaveLength(180));

  it.each(combos)('%s × %s 를 오류 없이 그린다', (id, fw) => {
    const a = composeAssignment(drafts.find((d) => d.id === id)!, fw);
    for (let sel = 0; sel < 7; sel++) {
      const { svg, pins } = renderMockup(a, sel, () => {}, true);
      const html = renderToStaticMarkup(<>{svg}</>);
      expect(html.startsWith('<svg')).toBe(true);
      expect(html).not.toMatch(/NaN|undefined|Infinity/);
      expect(pins.length).toBeGreaterThanOrEqual(5);
      expect(new Set(pins.map((p) => p.key)).size).toBe(pins.length);
    }
  });
});
