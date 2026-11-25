import type { CrudKey, FrameworkId, LayoutId, Level } from '../schema/common';

// 과제 정책 값 — 기준 문서: docs/05_assignment-rules.md (값을 바꾸면 문서도 함께)

export const LEVEL_LABEL: Record<Level, string> = { basic: '초급', intermediate: '중급' };
/** 난이도 한 줄 정의 (프롬프트에 삽입) — 05#난이도-정의 */
export const LEVEL_SUMMARY: Record<Level, string> = {
  basic: '컨트롤 사용법과 이벤트·바인딩 연습. CRUD·DB 없이 화면 안에서만 동작하고, 화면과 로직 클래스를 분리한다.',
  intermediate: '실무 레이아웃 패턴과 조회·등록·수정·삭제 흐름 연습. DB를 직접 설계해 쓰고 3-tier 구조로 만든다.',
};
export const CRUD_NAMES: Record<CrudKey, string> = { R: '조회 / 검색', C: '신규 등록', U: '수정', D: '삭제' };

/** 예상 소요 기간 (필수 기능 기준) — 05#예상-소요-기간 */
export const BASE_DAYS: Record<LayoutId, [number, number]> = {
  form: [1, 1], calc: [1, 1], lookup: [1, 1], todo: [1, 2], settings: [1, 2], wizard: [2, 2],
  gridForm: [4, 5], masterDetail: [4, 5], kanban: [4, 5], dashboard: [4, 5], treeGrid: [4, 5], calendar: [5, 6],
};
export const DAY_ADJUST: Record<FrameworkId, Record<Level, number>> = {
  wpf: { basic: 1, intermediate: 0 },
  winform: { basic: 0, intermediate: 0 },
  react: { basic: 0, intermediate: 0 },
  python: { basic: 0, intermediate: -1 },
  node: { basic: 0, intermediate: 0 },
};

/** 채점표 — 05#채점표 */
export const BONUS = { basic: 3, intermediate: 5, maxItems: 4 } as const;
export const GRADES = [
  { min: 90, label: 'A · 우수' },
  { min: 75, label: 'B · 통과' },
  { min: 60, label: 'C · 보완 후 통과' },
  { min: 0, label: '재제출' },
] as const;
export const gradeOf = (score: number) => GRADES.find((g) => score >= g.min)!.label;

export const RUBRIC_TEXT = {
  basic: {
    structure: [['화면 코드와 계산·검증 로직이 분리됨', 10], ['컨트롤·메서드 이름이 역할을 드러냄', 5], ['중복 없이 메서드로 나눔', 5]],
    structureWpf: [['코드 비하인드에 로직 없음 (InitializeComponent만)', 8], ['Click 이벤트 대신 Command·바인딩 사용', 7], ['계산·검증이 Logic 클래스로 분리됨', 5]],
    ui: [['예시 화면과 같은 배치·정렬', 5], ['탭 이동 순서와 첫 포커스 설정', 5]],
    submit: [['README에 실행 방법과 화면 캡처', 5], ['의미 있는 단위로 커밋', 5]],
  },
  intermediate: {
    crudPoints: { R: 8, C: 8, U: 7, D: 7 } as Record<CrudKey, number>,
    tierRest: [['Data 계층이 분리되어 교체 가능', 5], ['계층 간 모델/DTO로 전달', 5]],
    data: [['필수값·중복 방지를 DB 제약으로도 반영', 5], ['날짜·금액 등 타입 선택이 적절함', 5]],
    quality: [['네이밍과 메서드 길이가 적절함', 5], ['Business 계층 단위 테스트 2개 이상', 5], ['기능 단위 커밋과 PR 설명 작성', 5]],
  },
} as const satisfies Record<string, Record<string, unknown>>;

/** 코드 구조 원칙 — 05#코드-구조-원칙 */
export const ARCH_RULES = {
  basic: ['이벤트 처리 코드는 입력값을 로직 클래스에 넘기고 결과만 표시', '로직 클래스는 화면 컨트롤을 직접 참조하지 않음', '중급 과제의 3-tier 구조로 가기 위한 첫 단계'],
  basicWpf: [
    '코드 비하인드(.xaml.cs)에는 InitializeComponent() 외 코드를 두지 않음',
    '버튼은 Command, 입력값은 TwoWay 바인딩으로 연결',
    'ViewModel은 TextBox 같은 화면 컨트롤을 직접 참조하지 않음',
    '계산·검증은 Logic 클래스에 두고 ViewModel에서 호출',
  ],
  firstIntermediate: {
    default: '화면 계층에는 SQL·DB 접근 코드를 두지 않음',
    wpf: '코드 비하인드에는 InitializeComponent()만 — 로직은 ViewModel 이하, SQL은 Data 계층에만',
    react: '컴포넌트 안에서 fetch를 직접 호출하지 않음',
  } as Partial<Record<FrameworkId, string>> & { default: string },
  intermediateRest: ['Data 계층은 저장·조회만 담당하고, 바꿔 끼울 수 있게 분리', '의존 방향은 위에서 아래로 한 방향, 계층 간에는 모델/DTO로 전달'],
  reactNote: 'React는 프론트엔드 안에서의 계층 분리예요. 실제 DB 역할은 json-server가 맡습니다.',
};

/** 데이터 설계 가이드 — 05#데이터-설계-가이드-중급 */
export const DATA_GUIDE = {
  fixed: ['상태값을 코드 테이블로 둘지, CHECK 제약으로 둘지 비교하기', '등록일시·수정일시·작성자 같은 공통 컬럼 넣기'],
  web: 'API를 URL·메서드·요청/응답 예시·상태 코드 표로 먼저 정리하기',
  deliverable: 'README에 ERD와 "왜 이렇게 설계했는지" 3줄 이상 정리',
};
