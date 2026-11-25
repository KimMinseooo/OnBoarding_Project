import { describe, expect, it } from 'vitest';
import { clip, niceTop, tw } from './kit';

describe('렌더러 도우미', () => {
  it('niceTop: 데이터 최대값을 4칸으로 나눠 떨어지는 보기 좋은 값으로', () => {
    expect(niceTop(5)).toBe(8);
    expect(niceTop(350)).toBe(400);
    expect(niceTop(84)).toBe(100);
    expect(niceTop(0)).toBe(4);
    for (const v of [3, 7, 12, 95, 1370]) expect(niceTop(v)).toBeGreaterThanOrEqual(v);
  });
  it('clip: 폭을 넘으면 줄이고 …를 붙인다', () => {
    expect(clip('짧은 제목', 12, 200)).toBe('짧은 제목');
    const c = clip('노트북 전원이 켜지지 않음', 12, 100, true);
    expect(c.endsWith('…')).toBe(true);
    expect(tw(c, 12) * 1.06).toBeLessThanOrEqual(100);
  });
});
