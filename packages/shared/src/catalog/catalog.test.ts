import { describe, expect, it } from 'vitest';
import { BASIC_LAYOUTS, FRAMEWORK_IDS, INTERMEDIATE_LAYOUTS, LAYOUT_IDS } from '../schema/common';
import { CONTROL_NAMES } from './controls';
import { FRAMEWORKS } from './frameworks';
import { LAYOUTS } from './layouts';
import { BASE_DAYS, gradeOf } from './rules';

describe('카탈로그 무결성', () => {
  it('모든 화면 유형이 정의되어 있고 난이도가 맞다', () => {
    for (const id of BASIC_LAYOUTS) expect(LAYOUTS[id].level).toBe('basic');
    for (const id of INTERMEDIATE_LAYOUTS) {
      expect(LAYOUTS[id].level).toBe('intermediate');
      expect(LAYOUTS[id].learningGoal).toBeTruthy();
    }
  });

  it('화면 유형이 쓰는 컨트롤은 모두 프레임워크별 이름이 있다', () => {
    for (const id of LAYOUT_IDS)
      for (const c of [...LAYOUTS[id].controls, ...LAYOUTS[id].pins.map((p) => p.control)])
        for (const fw of FRAMEWORK_IDS) expect(CONTROL_NAMES[c][fw], `${id}.${c}.${fw}`).toBeTruthy();
  });

  it('프레임워크의 첫 제안 화면 유형이 난이도에 맞다', () => {
    for (const fw of FRAMEWORK_IDS) {
      expect(LAYOUTS[FRAMEWORKS[fw].firstLayout.basic].level).toBe('basic');
      expect(LAYOUTS[FRAMEWORKS[fw].firstLayout.intermediate].level).toBe('intermediate');
    }
  });

  it('모든 화면 유형에 소요 기간이 있다', () => {
    for (const id of LAYOUT_IDS) expect(BASE_DAYS[id][0]).toBeLessThanOrEqual(BASE_DAYS[id][1]);
  });

  it('등급 기준 (docs/05#등급)', () => {
    expect([gradeOf(95), gradeOf(80), gradeOf(60), gradeOf(59)]).toEqual(['A · 우수', 'B · 통과', 'C · 보완 후 통과', '재제출']);
  });
});
