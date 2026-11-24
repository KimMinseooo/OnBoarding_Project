import { readFileSync, readdirSync } from 'node:fs';

// 테스트 전용: 저장소 루트 fixtures/*.json 읽기
const DIR = new URL('../../../../fixtures/', import.meta.url);

export function loadFixtures(): { file: string; json: unknown }[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => ({ file, json: JSON.parse(readFileSync(new URL(file, DIR), 'utf8')) as unknown }));
}
