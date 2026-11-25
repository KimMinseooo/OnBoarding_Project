import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AssignmentDraftSchema, FRAMEWORK_IDS, composeAssignment } from '@obp/shared';
import { buildExport } from './exportFiles';
import { exportBaseName } from './markdown';

const DIR = new URL('../../../../../fixtures/', import.meta.url);
const drafts = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => AssignmentDraftSchema.parse(JSON.parse(readFileSync(new URL(f, DIR), 'utf8'))));
const all = drafts.flatMap((d) => FRAMEWORK_IDS.map((fw) => composeAssignment(d, fw, `${d.id}-${fw}`)));

describe('내보내기', () => {
  it.each(all.map((a) => [a.id, a] as const))('%s: 명세서에 과제의 모든 내용이 들어간다', (_id, a) => {
    const { markdown, svg } = buildExport(a, new Date('2026-11-25'));
    const md = markdown.text;
    expect(md.startsWith(`# ${a.title}\n`)).toBe(true);
    expect(md).toContain(a.scenario);
    for (const r of a.requirements) for (const item of r.items) expect(md).toContain(item);
    for (const t of [...a.exceptions, ...a.optionalFeatures, ...a.architecture.rules]) expect(md).toContain(t);
    for (const q of a.dataGuide?.questions ?? []) expect(md).toContain(q);
    for (const h of a.hints ?? []) expect(md).toContain(h);
    expect(md).toContain('| **합계** | | **100** |');
    expect(md).toContain(`](${encodeURI(svg.name)})`);
    expect(md).not.toMatch(/undefined|NaN|\n{3,}/);
    expect(svg.text).toMatch(/^<\?xml[^>]+>\n<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(svg.text).not.toMatch(/NaN|undefined/);
  });

  it('파일 이름에 쓸 수 없는 문자를 바꾼다', () => {
    const a = { ...all[0]!, title: '경비/출장 정산: "신규"' };
    expect(exportBaseName(a)).not.toMatch(/[\\/:*?"<>|\s]/);
  });

  it('사람이 확인할 샘플 파일을 남긴다 (.runner/out/export-samples, Git 제외)', () => {
    const dir = new URL('../../../../../.runner/out/export-samples/', import.meta.url);
    mkdirSync(dir, { recursive: true });
    for (const a of [all.find((x) => x.framework === 'wpf' && x.level === 'basic')!, all.find((x) => x.framework === 'react' && x.layout === 'kanban')!]) {
      const { markdown, svg } = buildExport(a, new Date('2026-11-25'));
      writeFileSync(new URL(markdown.name, dir), markdown.text);
      writeFileSync(new URL(svg.name, dir), svg.text);
    }
  });
});
