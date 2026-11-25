# CLAUDE.md

이 저장소에서 작업하는 Claude(및 개발자)를 위한 작업 지침입니다.
**무엇을 만드는지**는 `docs/`가 기준이고, 이 파일은 **어떻게 작업하는지**만 다룹니다. 명세 내용을 여기에 옮겨 적지 않습니다.

## 프로젝트 한 줄 요약

신입사원 온보딩용 실무 과제(개발 명세서 + 예시 화면 + 채점표)를 Claude API로 생성하는 React 웹앱과 Express 서버.

## 작업 시작 전에 읽을 것

1. `README.md` — 문서 지도 (어떤 내용이 어느 문서에 있는지)
2. `docs/00_roadmap.md` — **현재 단계**와 그 단계의 완료 기준
3. 작업과 관련된 문서만 추가로 읽기 (전부 읽지 않아도 됨)

| 작업 | 읽을 문서 |
|---|---|
| 화면·상호작용 | `docs/02_ui-spec.md` |
| 폴더·API·환경 변수 | `docs/03_architecture.md` |
| 과제 데이터, zod 스키마 | `docs/04_assignment-schema.md` |
| 난이도·채점·기간 등 정책 | `docs/05_assignment-rules.md` |
| 프레임워크 카탈로그 | `docs/06_frameworks.md` |
| 화면 유형·예시 화면 렌더러 | `docs/07_layouts.md` |
| Claude API 호출·프롬프트 | `docs/08_prompt.md` |

## 단일 출처 원칙 (가장 중요)

- 같은 사실을 두 곳에 쓰지 않습니다. 문서끼리는 링크로, 코드는 `packages/shared`를 import해서 씁니다.
- 정책 값(배점, 기간, 기술 목록, 컨트롤 이름 등)을 컴포넌트·서버 코드·프롬프트에 **하드코딩하지 않습니다**. 반드시 `packages/shared/catalog`에서 읽습니다.
- 데이터 형식은 `packages/shared/schema` 하나만 씁니다. 웹과 서버가 각자 타입을 정의하지 않습니다.
- `mockup/onboarding-mockup.html`은 **참고용**입니다. 문서와 다르면 문서를 따릅니다 (`docs/09_decisions.md` 하단 참고).

## 문서 먼저, 코드는 나중

변경 요청을 받으면 이 순서로 진행합니다.

1. 어느 문서가 기준인지 찾기 (README의 문서 지도)
2. 그 문서를 먼저 수정, 맨 위 **최종 수정일** 갱신
3. 정책·구조가 바뀌었으면 `docs/09_decisions.md`에 한 줄 추가 (무엇을, 왜)
4. 카탈로그·스키마 코드 반영 → 기능 코드 반영 → 테스트
5. 로드맵 단계를 끝냈으면 `docs/00_roadmap.md`의 "현재 위치" 갱신

문서와 코드가 어긋난 것을 발견하면 임의로 한쪽을 고치지 말고 사용자에게 어느 쪽이 맞는지 먼저 확인합니다.

## 절대 지킬 것

- **API 키는 서버에만.** 웹 코드에서 Anthropic API를 직접 호출하거나 키를 노출하지 않습니다. `.env`는 커밋하지 않고 `.env.example`만 관리합니다.
- **모델 ID는 `ANTHROPIC_MODEL` 환경 변수로.** 코드에 고정하지 않습니다.
- **예시 화면은 렌더러가 그립니다.** Claude 응답으로 SVG·HTML을 받지 않습니다 (`docs/03` 핵심 설계 원칙).
- **규칙이 정해진 필드는 서버가 채웁니다.** 채점표·폴더 구조·기술 배지 등을 프롬프트로 생성하지 않습니다 (`docs/08` 역할 나누기).
- **Mock 모드를 깨지 않습니다.** `USE_MOCK=true`로 API 키 없이 전체 흐름이 동작해야 합니다.
- 샘플·fixture에 실존 인물·회사 이름을 쓰지 않습니다.

## 코드 작성 규칙

- 언어: TypeScript strict. 공유 타입은 `@obp/shared`에서 import하고, 웹·서버에서 같은 타입을 다시 정의하지 않습니다
- 폴더 구조는 `docs/03_architecture.md`를 따르고, 새 폴더가 필요하면 문서부터 고칩니다
- 컴포넌트·함수 이름은 영어, 사용자에게 보이는 문구와 주석은 한국어
- 주석은 "왜"를 씁니다. 명세 내용을 주석에 복사하지 말고 문서 경로를 적습니다
  - 예) `// 배점 기준: docs/05_assignment-rules.md#채점표`
- 예시 화면 렌더러: 공통 컨트롤(`renderer/controls`)을 재사용하고, 스킨별 차이는 `renderer/skins`의 값으로만 처리합니다

## 테스트

- 스키마: 모든 `fixtures/*.json`이 검증을 통과해야 함
- 채점표: 가산점을 뺀 합계 = 100
- 렌더러: fixture × 프레임워크 5종 조합이 오류 없이 그려짐 (스냅샷)
- 서버: Mock 모드 `POST /api/assignments` 응답이 스키마를 통과
- 작업을 끝냈다고 말하기 전에 테스트를 실행하고 결과를 확인합니다

## 명령어

모두 저장소 루트에서 실행합니다. Node 22.12 이상(`.nvmrc`).

| 명령 | 용도 |
|---|---|
| `npm install` | 의존성 설치 (워크스페이스 전체) |
| `cp .env.example .env` | 환경 변수 파일 만들기 (처음 한 번) |
| `npm run dev` | 서버(3001) + 웹(5173) 동시 실행 |
| `npm test` | 전체 테스트 (워크스페이스별 Vitest) |
| `npm run typecheck` | 전체 타입 검사 |
| `npm run lint` | ESLint |
| `npm run format` | Prettier로 정리 |
| `npm run build` | 웹 빌드 (`apps/web/dist`) |
| `npm start` | 서버 실행 (운영) |

특정 워크스페이스만: `npm run test -w @obp/server`

처음 설치·전체 확인을 한 번에: Finder에서 `scripts/step1-setup.command` 더블클릭 (기록: `logs/step1-setup.log`)

작업을 마치기 전 확인 순서: `npm run typecheck` → `npm run lint` → `npm test`

## 터미널 작업 실행 (작업 실행기)

맥 터미널에는 Claude가 직접 입력할 수 없으므로, 맥에서 켜 둔 **작업 실행기**를 통해 명령을 실행합니다.

- 켜기: Finder에서 `scripts/runner.command` 더블클릭 (창을 닫으면 꺼짐)
- 요청: `scripts/runner/request.sh <작업> ['<JSON 인자>']` → 출력과 `DONE {code}`를 돌려줌
- 실행기가 꺼져 있으면 `RUNNER_OFFLINE` — 사용자에게 켜 달라고 요청
- **허용 목록에 있는 작업만** 실행됩니다 (`scripts/runner/tasks.mjs`). 셸을 거치지 않고 인자 배열로 실행
- 새 작업이 필요하면 `tasks.mjs`에 추가하고 아래 표를 갱신 (사용자에게 알린 뒤)

| 작업 | 내용 |
|---|---|
| `install` | npm install |
| `verify` | 타입 검사 → 린트 → 테스트 (작업 마무리 때 필수) |
| `typecheck` / `lint` / `lint-fix` / `test` / `format` / `build` | 개별 실행 |
| `audit` / `audit-fix` / `outdated` | 보안 점검, 호환 범위 수정, 새 버전 확인 |
| `add` / `remove` | 패키지 추가·제거 `{"workspace":"@obp/server","packages":["이름@버전"],"dev":false}` |
| `dev-start` / `dev-stop` / `health` | 개발 서버 켜기·끄기·응답 확인 |
| `api-check` | 개발 서버에 고정된 샘플 생성 요청을 보내 응답 확인 |
| `claude-check` | 실제 Claude API로 생성 점검 `{"rounds":3}` → 실패율·시간 요약, 결과물은 `.runner/out/claude-check/` (**비용 발생**, 사용자 확인 후 실행) |
| `prod-check` | 배포 모드 점검: 웹 빌드 → 서버 하나로 화면+API(포트 3100) 확인 후 종료 |
| `vercel-check` | Vercel 빌드(`.vercel/output`) 생성 후 함수를 로컬에서 띄워 `/api` 확인 |
| `runner-restart` | 실행기를 새 코드로 다시 켬 (맥 앞에 없을 때). 이후에는 창 없이 백그라운드로 돌고 출력은 `.runner/runner.log` |
| `git-status` / `git-log` / `git-diff` | Git 확인 |
| `git-commit` | 전체 변경 커밋 `{"message":"[단계N] 요약"}` |

Git push는 허용 목록에 없습니다 (원격 저장소 연결 후 사용자가 직접).

## Git

- 브랜치: `main` 보호, 작업은 `feat/…`, `fix/…`, `docs/…`
- 커밋 메시지: `[단계N] 요약` 또는 `docs: 요약` (한국어 가능)
- 문서 변경과 코드 변경은 가능하면 커밋을 나눕니다
