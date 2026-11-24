import { CRUD_KEYS, type FrameworkId } from '../schema/common';
import type { AssignmentDraft } from '../schema/draft';
import { AssignmentSchema, type Assignment, type RubricGroup } from '../schema/assignment';
import { controlName } from '../catalog/controls';
import { FRAMEWORKS } from '../catalog/frameworks';
import { LAYOUTS } from '../catalog/layouts';
import { ARCH_RULES, BASE_DAYS, BONUS, CRUD_NAMES, DATA_GUIDE, DAY_ADJUST, RUBRIC_TEXT } from '../catalog/rules';

/**
 * Draft(업무 내용) + 프레임워크 → 완성된 과제.
 * 무엇을 누가 채우는지: docs/08_prompt.md#역할-나누기-claude가-만드는-것-vs-서버가-채우는-것
 */
export function composeAssignment(draft: AssignmentDraft, framework: FrameworkId, id?: string): Assignment {
  const fw = FRAMEWORKS[framework];
  const layout = LAYOUTS[draft.layout];
  const basic = draft.level === 'basic';
  const names = templateNames(draft);
  const fill = (t: string) => fillTemplate(t, names);
  const uniq = (xs: string[]) => [...new Set(xs)];

  const [d0, d1] = BASE_DAYS[draft.layout];
  const adj = DAY_ADJUST[framework][draft.level];

  const requirements = basic
    ? draft.requirements
    : draft.requirements.map((r, i) => {
        const op = CRUD_KEYS[i]!;
        return { key: op, name: CRUD_NAMES[op], items: [...r.items, fill(fw.intermediate.impl[op]), fill(fw.intermediate.advanced[op])] };
      });

  const architecture = buildArchitecture(framework, draft, fill);
  const optionalFeatures = [...draft.optionalFeatures, ...(basic ? [] : fw.intermediate.optional)];
  const exceptions = [...draft.exceptions, basic ? fw.basic.exception : fw.intermediate.exception];

  const assignment = {
    id: id ?? `${draft.id ?? draft.entity.slug}-${framework}`,
    framework,
    level: draft.level,
    layout: draft.layout,
    title: draft.title,
    team: draft.team,
    scenario: `${draft.problem} ${basic ? fw.basic.how : fw.intermediate.how}`,
    learningGoal: basic ? draft.learningGoal! : layout.learningGoal!,
    estimatedDays: { min: d0 + adj, max: d1 + adj },
    controls: uniq(layout.controls.map((k) => controlName(framework, k))),
    tech: basic ? fw.basic.tech : fw.intermediate.tech,
    architecture,
    requirements,
    optionalFeatures,
    hints: basic ? fw.basic.hints : undefined,
    exceptions,
    dataGuide: basic ? undefined : buildDataGuide(framework, draft),
    rubric: buildRubric(framework, draft, { requirements, exceptions, optionalFeatures, firstRule: architecture.rules[0]! }),
    mockup: {
      appTitle: draft.mockup.appTitle,
      url: fw.devHost ? `${fw.devHost}/${draft.entity.slug}` : undefined,
      nav: fw.kind === 'web' ? (draft.mockup.nav ?? [draft.title, '도움말']) : undefined,
      menu: fw.menu,
      data: draft.mockup.data,
    },
  };
  // 조립 결과도 반드시 완성본 규칙을 통과해야 합니다 (예: 채점표 100점)
  return AssignmentSchema.parse(assignment);
}

/* ---------- 템플릿 ---------- */
type Names = Record<'Entity' | 'entity' | 'entity_snake' | 'Logic' | 'logic' | 'logic_snake' | 'slug', string>;
const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function templateNames(d: AssignmentDraft): Names {
  const logic = d.logicClass ?? `${d.entity.name}Logic`;
  return {
    Entity: d.entity.name,
    entity: lowerFirst(d.entity.name),
    entity_snake: snake(d.entity.name),
    Logic: logic,
    logic: lowerFirst(logic),
    logic_snake: snake(logic),
    slug: d.entity.slug,
  };
}
export function fillTemplate(t: string, n: Names): string {
  return t.replace(/\{(Entity|entity_snake|entity|Logic|logic_snake|logic|slug)\}/g, (_, k: keyof Names) => n[k]);
}

/* ---------- 코드 구조 ---------- */
function buildArchitecture(framework: FrameworkId, d: AssignmentDraft, fill: (t: string) => string): Assignment['architecture'] {
  const fw = FRAMEWORKS[framework];
  if (d.level === 'basic') {
    const f = fw.basic.folders.map((files) => files.map(fill));
    if (framework === 'wpf')
      return {
        title: 'MVVM (View · ViewModel · Logic)',
        layers: [
          { name: 'View', role: 'XAML 화면 · 바인딩만', files: f[0]! },
          { name: 'ViewModel', role: '화면 상태·Command', files: f[1]! },
          { name: 'Logic', role: '계산·검증 — 단독 테스트 가능', files: f[2]! },
        ],
        rules: ARCH_RULES.basicWpf,
      };
    return {
      title: '화면과 로직 분리 (2계층)',
      layers: [
        { name: '화면', role: '입력을 읽고 결과를 보여 주는 일만', files: f[0]! },
        { name: '로직', role: '계산·검증 — 화면 없이도 테스트 가능', files: f[1]! },
      ],
      rules: ARCH_RULES.basic,
    };
  }
  const t = fw.intermediate.folders;
  return {
    title: '3-tier 구조',
    layers: [
      { name: 'Presentation', role: '화면 표시·입력, 사용자 이벤트', files: t.presentation.map(fill) },
      { name: 'Business', role: '업무 규칙·검증·트랜잭션', files: t.business.map(fill) },
      { name: 'Data', role: '저장·조회만 담당', files: t.data.map(fill) },
    ],
    common: t.common.map(fill),
    rules: [
      ARCH_RULES.firstIntermediate[framework] ?? ARCH_RULES.firstIntermediate.default,
      `"${d.businessRule}" 같은 업무 규칙은 Business 계층에 구현`,
      ...ARCH_RULES.intermediateRest,
    ],
    note: framework === 'react' ? ARCH_RULES.reactNote : undefined,
  };
}

/* ---------- 데이터 설계 가이드 ---------- */
function buildDataGuide(framework: FrameworkId, d: AssignmentDraft): Assignment['dataGuide'] {
  const data = d.mockup.data as { form: { label: string }[]; rows: string[][] };
  const web = FRAMEWORKS[framework].kind === 'web';
  return {
    questions: [
      `화면 항목(${data.form.map((f) => f.label).join(', ')})을 출발점으로, 필요한 테이블과 컬럼을 정해 보기`,
      `업무 코드(예: ${data.rows[0]![0]})와 내부 기본키를 따로 둘지 정하고 이유 적기`,
      ...DATA_GUIDE.fixed,
      d.relationHint!,
      ...(web ? [DATA_GUIDE.web] : []),
    ],
    deliverable: DATA_GUIDE.deliverable,
  };
}

/* ---------- 채점표 ---------- */
type RubricInput = { requirements: Assignment['requirements']; exceptions: string[]; optionalFeatures: string[]; firstRule: string };
const items = (xs: readonly (readonly [string, number])[]) => xs.map(([text, points]) => ({ text, points }));

function buildRubric(framework: FrameworkId, d: AssignmentDraft, x: RubricInput): RubricGroup[] {
  const basic = d.level === 'basic';
  const bonus: RubricGroup = {
    group: '가산점 (선택 기능)',
    bonus: true,
    items: x.optionalFeatures.slice(0, BONUS.maxItems).map((text) => ({ text, points: basic ? BONUS.basic : BONUS.intermediate })),
  };
  if (basic) {
    const R = RUBRIC_TEXT.basic;
    return [
      { group: '기능 요구사항', items: x.requirements.map((r) => ({ text: `${r.name}: ${r.items[0]}`, points: 10 })) },
      { group: '예외 처리', items: x.exceptions.slice(0, 4).map((text) => ({ text, points: 5 })) },
      { group: '코드 구조', items: items(framework === 'wpf' ? R.structureWpf : R.structure) },
      { group: 'UI·사용성', items: items(R.ui) },
      { group: '제출물', items: items(R.submit) },
      bonus,
    ];
  }
  const R = RUBRIC_TEXT.intermediate;
  return [
    { group: '기능 (CRUD)', items: d.requirements.map((r, i) => ({ text: `${CRUD_NAMES[CRUD_KEYS[i]!]}: ${r.items[0]}`, points: R.crudPoints[CRUD_KEYS[i]!] })) },
    {
      group: '3-tier 구조',
      items: [
        { text: x.firstRule, points: 8 },
        { text: `업무 규칙("${d.businessRule}")이 Business 계층에 있음`, points: 7 },
        ...items(R.tierRest),
      ],
    },
    {
      group: '데이터 설계',
      items: [{ text: framework === 'react' ? 'db.json 구조와 설계 이유를 README에 정리' : 'ERD와 설계 이유를 README에 정리', points: 5 }, ...items(R.data)],
    },
    { group: '예외·검증', items: x.exceptions.slice(0, 3).map((text) => ({ text, points: 5 })) },
    { group: '코드 품질·제출', items: items(R.quality) },
    bonus,
  ];
}
