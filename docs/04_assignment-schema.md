# 04. 과제 데이터 형식

> 최종 수정일: 2026-11-25
> 코드 위치: `packages/shared/src/schema`

형식은 두 가지입니다. **필드를 추가·변경할 때는 이 문서를 먼저 고칩니다.**

| 형식 | 누가 만드나 | 어디서 쓰나 |
|---|---|---|
| `AssignmentDraft` | Claude (또는 fixtures) | 업무 내용만 담음, 프레임워크와 무관 |
| `Assignment` | 조립기 `composeAssignment(draft, framework)` | 웹 화면이 표시하는 완성본 |

조립기는 Draft에 [05](05_assignment-rules.md)·[06](06_frameworks.md)·[07](07_layouts.md)의 규칙 값을 더해 Assignment를 만듭니다. 그래서 Draft 하나로 프레임워크 5종의 과제가 모두 나옵니다. 어떤 필드를 누가 채우는지는 [08](08_prompt.md#역할-나누기-claude가-만드는-것-vs-서버가-채우는-것)에 있습니다.

## AssignmentDraft (Claude 출력 · fixtures 형식)

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | fixtures만 | 파일 이름과 같음 (예: `basic-calc-trip-calc`) |
| `level` | `"basic"` \| `"intermediate"` | ✓ | |
| `layout` | `LayoutId` | ✓ | 난이도에 맞는 화면 유형 |
| `title`, `team` | string | ✓ | |
| `problem` | string | ✓ | 업무 문제 1~2문장 (구현 방식 문장은 조립기가 붙임) |
| `learningGoal` | string | 초급 | 중급은 07의 값 사용 |
| `entity` | `{ name, slug }` | ✓ | `name`: PascalCase 영문 (예: `Asset`), `slug`: URL용 kebab-case |
| `logicClass` | string | 초급 | 로직 클래스 이름 (예: `TripCostCalculator`) |
| `businessRule` | string | 중급 | Business 계층에 둘 대표 업무 규칙 한 문장 |
| `requirements` | `Requirement[]` | ✓ | 4개, **업무 항목만** (프레임워크 구현 포인트는 조립기가 붙임) |
| `optionalFeatures` | string[] | ✓ | 1~4개, 업무 관련 선택 기능만 |
| `exceptions` | string[] | ✓ | 정확히 3개, 업무 관련 조건만 |
| `relationHint` | string | 중급 | 데이터 설계 가이드의 관계 고민 포인트 |
| `mockup` | `{ appTitle, nav?, data }` | ✓ | `data`는 아래 화면 유형별 형식 |

## Assignment (완성본)

값을 무엇으로 채울지(배점, 기술 목록, 화면 유형별 구성)는 이 문서가 아니라 [05](05_assignment-rules.md)·[06](06_frameworks.md)·[07](07_layouts.md)이 정합니다.

## Assignment

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | string | ✓ | 생성 시 서버가 부여 |
| `framework` | `FrameworkId` | ✓ | [06](06_frameworks.md)의 ID |
| `level` | `"basic"` \| `"intermediate"` | ✓ | 초급 / 중급 |
| `layout` | `LayoutId` | ✓ | [07](07_layouts.md)의 ID, 난이도와 맞아야 함 |
| `title` | string | ✓ | 과제 제목, 40자 이내 |
| `team` | string | ✓ | 요청 부서 예시 |
| `scenario` | string | ✓ | 업무 문제 + 구현 방식, 2~3문장 |
| `learningGoal` | string | ✓ | 한 문장 |
| `estimatedDays` | `{ min, max }` | ✓ | [05 소요 기간 표](05_assignment-rules.md#예상-소요-기간)로 계산 (서버가 채움) |
| `controls` | string[] | ✓ | 필수 컨트롤 이름 (06의 컨트롤 이름 표 기준) |
| `tech` | string[] | ✓ | 핵심 기술 |
| `architecture` | `Architecture` | ✓ | 코드 구조 |
| `requirements` | `Requirement[]` | ✓ | 필수 요구사항 카드, 정확히 4개 |
| `optionalFeatures` | string[] | ✓ | 선택 기능, 2~5개 |
| `hints` | string[] | 초급 | 구현 힌트 |
| `exceptions` | string[] | ✓ | 예외 처리 조건, 3~6개 |
| `dataGuide` | `DataGuide` | 중급 | 데이터·API 설계 가이드 |
| `rubric` | `RubricGroup[]` | ✓ | 채점표 |
| `mockup` | `Mockup` | ✓ | 예시 화면 데이터 |

## 하위 타입

```ts
type Requirement   = { key: string; name: string; items: string[] }  // 중급 key: R|C|U|D, 초급 key: 1~4
type Architecture  = { title: string; layers: Layer[]; common?: string[]; rules: string[]; note?: string }
type Layer         = { name: string; role: string; files: string[] }
type DataGuide     = { questions: string[]; deliverable: string }
type RubricGroup   = { group: string; bonus?: boolean; items: { text: string; points: number }[] }
```

## Mockup

모든 화면 유형 공통:

| 필드 | 타입 | 설명 |
|---|---|---|
| `appTitle` | string | 창 제목 / 브라우저 탭 제목 |
| `url` | string? | 웹 프레임워크만 |
| `nav` | string[]? | 웹 상단 메뉴 |
| `menu` | string[]? | 데스크톱 메뉴 바 (06 기준) |
| `data` | 아래 화면 유형별 | |

### 공통 입력 항목 `Field`

```ts
type Field = {
  label: string
  type: "text" | "ro" | "multi" | "combo" | "date" | "num" | "radio" | "check" | "slider"
  value?: string | string[]   // multi는 줄 배열
  options?: string[]          // radio, check
  selected?: number | number[]// radio: 인덱스, check: 인덱스 배열
  unit?: string               // num
  percent?: number            // slider 위치 0~1
  placeholder?: string
  required?: boolean
}
```

### 초급 화면 유형의 `data`

| layout | data |
|---|---|
| `form` | `{ groupLabel, fields: Field[], doneMessage: [제목, 본문] }` |
| `calc` | `{ fields: Field[], result: { label, value, unit }, breakdown: [항목, 값][], note }` |
| `todo` | `{ placeholder, items: { text, done, tag }[], tagColors: {태그: 색} }` |
| `settings` | `{ tabs: string[], panels: Field[][] }` (tabs와 panels 길이 같음) |
| `wizard` | `{ steps: string[], pages: Field[][] }` (마지막 페이지는 확인 단계) |
| `lookup` | `{ people: { name, position, dept, ext, mail, location }[] }` |

### 중급 화면 유형의 `data`

모든 중급 유형에 공통으로 들어가는 표 데이터:

```ts
type TableData = {
  columns: { header: string; width: number; align?: "right" }[]
  rows: string[][]              // 5~7행, 각 행 길이 = columns 길이
  statusColumn: number          // 상태 값이 있는 열 인덱스
  statusColors: Record<string, string>
  form: { label: string; column: number; type: "ro"|"text"|"combo"|"date"; required?: boolean }[]
  total: number                 // 전체 건수 표시용
  search?: { combo: string; text: string; range: string; rangeValue: [string, string] }
}
```

유형별로 더하는 필드:

| layout | 추가 필드 |
|---|---|
| `gridForm` | `search` 필수 |
| `masterDetail` | `nameColumn, subColumn, tabs: string[], history: { title, columns, rows }` |
| `kanban` | `lanes: string[], titleColumn, typeColumn, ownerColumn, moveLabel` |
| `calendar` | `days: number[]` (행별 요일 0~4), `times: [시작, 끝][]` (9~18, 0.5 단위) |
| `dashboard` | `kpis: { label, value, delta, good }[]` (4개), `chart: { labels, a, b }`, `ratio: [이름, %, 색][]` |
| `treeGrid` | `tree: { text, level, expanded?, count }[]`, `treeSelected`, `contextMenu: string[]` (`"-"`는 구분선) |

## 검증 규칙 (스키마 외 추가 검사)

- `rubric`에서 `bonus`가 아닌 그룹의 점수 합 = **100**
- `layout`은 `level`에 맞는 화면 유형이어야 함 ([07](07_layouts.md))
- `level = "intermediate"`이면 `dataGuide` 필수, `hints` 없음
- `requirements`와 `rubric`에 선택 기능이 섞이면 안 됨 ([05의 선택 기능 목록](05_assignment-rules.md#필수선택-기능-원칙))
- 표 데이터: 모든 `rows[i].length === columns.length`, `statusColumn`의 값은 모두 `statusColors`에 있음
- 실제 인물·회사명 사용 금지 (예시 이름만)

## 예시 (축약)

```json
{
  "framework": "wpf",
  "level": "basic",
  "layout": "calc",
  "title": "출장비 계산기",
  "team": "재무팀",
  "requirements": [
    { "key": "1", "name": "입력", "items": ["지역·교통수단에 따라 단가 변경"] }
  ],
  "optionalFeatures": ["조건을 바꾸면 이전 결과를 흐리게 표시"],
  "rubric": [
    { "group": "기능 요구사항", "items": [{ "text": "입력: 지역별 단가 적용", "points": 10 }] },
    { "group": "가산점 (선택 기능)", "bonus": true, "items": [{ "text": "이전 결과 흐리게", "points": 3 }] }
  ],
  "mockup": {
    "appTitle": "출장비 계산기",
    "data": {
      "fields": [{ "label": "출장 일수", "type": "num", "value": "3", "unit": "일" }],
      "result": { "label": "예상 출장비 합계", "value": "486,000", "unit": "원" },
      "breakdown": [["일비 (3일 × 25,000)", "75,000"]],
      "note": "부산·제주는 숙박비 상한 90,000원 적용"
    }
  }
}
```
이 예시는 완성본(Assignment)입니다. `fixtures/`에는 Draft 형식으로 저장합니다.
