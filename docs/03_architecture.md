# 03. 아키텍처

> 최종 수정일: 2026-11-25 (2단계 반영)

## 핵심 설계 원칙

1. **Claude는 그림이 아니라 데이터를 만든다**
   예시 화면은 Claude가 SVG를 직접 그리지 않습니다. 정해진 화면 유형([07](07_layouts.md)) 중 하나를 고르고, 그 화면에 들어갈 데이터(컬럼, 행, 입력 항목 등)만 JSON으로 만듭니다. 그림은 우리 렌더러가 그립니다. 그래서 화면 품질이 항상 일정하고, 프레임워크 스킨도 바로 바꿀 수 있습니다.
2. **API 키는 서버에만**
   브라우저에서 Claude API를 직접 부르지 않습니다. 서버가 대신 호출합니다.
3. **Mock 모드 우선**
   서버는 환경 변수 하나로 샘플 데이터(fixtures)를 돌려줄 수 있어야 합니다. 화면 개발과 테스트는 API 없이 합니다.
4. **스키마 하나로 앞뒤를 검증**
   웹과 서버가 같은 스키마([04](04_assignment-schema.md))를 공유합니다.

## 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 언어 | TypeScript (strict) | 웹·서버·스키마 타입 공유 |
| 웹 | React 19 + Vite 7 + Tailwind CSS 4 | 목업과 같은 화면 구성, 빠른 개발 |
| 웹 상태 | React state + `useReducer` | 화면 하나라 전역 상태 라이브러리 불필요 |
| 서버 | Node.js 22 + Express 5, `tsx`로 실행 | API 키 보호용 얇은 서버, 빌드 단계 없이 TS 실행 |
| 스키마·검증 | zod (`packages/shared`) | 웹·서버 공유, 타입 생성 |
| Claude 호출 | Anthropic SDK (`@anthropic-ai/sdk`) | 구조화 출력(tool use) 지원 |
| 테스트 | Vitest (+ supertest) | 스키마·서버 API·렌더러 스냅샷 |
| 패키지 구성 | npm workspaces (`@obp/web`, `@obp/server`, `@obp/shared`) | 별도 도구 없이 모노레포 |
| 저장 | 1차 localStorage | 서버 DB는 백로그 |

## 폴더 구조

```
OnBoarding_Project/
├─ README.md
├─ docs/                      # 이 문서들
├─ mockup/                    # 확정 목업 (참고용)
├─ fixtures/                  # 샘플 과제 Draft JSON 16개 (Mock 모드·테스트용)
├─ packages/
│  └─ shared/
│     └─ src/
│        ├─ schema/           # zod 스키마 ← 04 문서
│        ├─ catalog/          # 프레임워크·화면 유형·규칙 상수 ← 05·06·07 문서
│        └─ compose/          # Draft + 프레임워크 → Assignment 조립기 (웹·서버 공용)
├─ apps/
│  ├─ web/
│  │  └─ src/
│  │     ├─ app/              # 레이아웃, 상태(reducer)
│  │     ├─ features/
│  │     │  ├─ generator/     # 컨트롤 바, 로딩, 결정 바, 제안 기록
│  │     │  ├─ spec/          # 명세서 패널 섹션들
│  │     │  └─ rubric/        # 채점표
│  │     ├─ renderer/
│  │     │  ├─ controls/      # TextBox, Grid, Tabs … (스킨 공통)
│  │     │  ├─ skins/         # wpf, winform, tk, web 색·모양
│  │     │  ├─ frames/        # 데스크톱 창, 브라우저 틀
│  │     │  └─ layouts/       # 화면 유형 12종
│  │     └─ api/              # 서버 호출
│  └─ server/
│     └─ src/
│        ├─ routes/           # /api/*
│        ├─ services/         # 생성 흐름(조립 → 호출 → 검증 → 재시도)
│        ├─ claude/           # Claude API 호출 (fetch, D-020)
│        ├─ prompts/          # 프롬프트 템플릿 ← 08 문서
│        └─ mock/             # fixtures 반환
└─ .env.example
```

## 데이터 흐름

```
[웹] 생성 클릭
  → POST /api/assignments { framework, level, recent[] }
[서버] USE_MOCK=true  → fixtures에서 조건에 맞는 Draft 선택
       USE_MOCK=false → 프롬프트 조립(08) → Claude 호출(구조화 출력) → Draft
                      → Draft 검증(04) → 실패 시 오류 내용 붙여 1회 재시도
       → composeAssignment(draft, framework) → Assignment 검증(04)
  → 200 { assignment } / 422 INVALID_OUTPUT (재시도 후에도 검증 실패) / 502 UPSTREAM_ERROR (Claude API 실패)
[웹] 결정 바·명세서·렌더러가 assignment 하나로 화면 구성
```

## 서버 API

| 메서드·경로 | 요청 | 응답 |
|---|---|---|
| `GET /api/health` | — | `{ ok, mock }` |
| `POST /api/assignments` | `{ framework, level, recent: [{ title, layout }] }` | `{ assignment, notice? }` |

- `recent`: 같은 프레임워크·난이도의 최근 제안(최신이 앞), 최대 20개. 중복과 같은 화면 유형 연속을 피하는 데 씀
- `notice`: 사용자에게 보여 줄 안내 (예: Mock 샘플을 모두 봐서 처음부터 다시 보여 줄 때)
- 요청 형식 오류는 400 `BAD_REQUEST`, 생성 결과 검증 실패는 422 `INVALID_OUTPUT`, Claude API 실패는 502 `UPSTREAM_ERROR` ([08](08_prompt.md#요청-흐름))
- 오류 응답 형식: `{ code, message }`

## 환경 변수 (`.env.example`)

| 이름 | 설명 |
|---|---|
| `ANTHROPIC_API_KEY` | 서버에서만 사용 |
| `ANTHROPIC_MODEL` | 사용할 모델 ID (코드에 고정하지 않음) |
| `ANTHROPIC_BASE_URL` | 비우면 공식 주소. 사내 게이트웨이·프록시를 거칠 때 바꿈 (D-020) |
| `ANTHROPIC_TIMEOUT_MS` | Claude 호출 1회 제한 시간, 기본 60000 |
| `USE_MOCK` | `true`면 fixtures 사용 |
| `PORT` | 서버 포트 |

## 네트워크 (사내망 대비)

- 웹은 외부 CDN·웹폰트를 쓰지 않습니다. 모든 라이브러리는 빌드에 포함하고, 글꼴은 OS 기본 한글 글꼴을 씁니다.
- 외부로 나가는 통신은 **서버의 Claude API 호출 하나**뿐입니다 (`POST {ANTHROPIC_BASE_URL}/v1/messages`). 사내망 조건(방화벽 예외, 프록시, 클라우드 경유 등)이 정해지면 이 절에 기록합니다.
- 사내 게이트웨이를 쓰면 `ANTHROPIC_BASE_URL`만 바꿉니다. Node 기본 fetch는 `HTTPS_PROXY`를 자동으로 따르지 않으므로, 프록시만 허용되는 망이면 이 부분을 추가로 구현해야 합니다.

## 저장

- 1차: 제안 기록과 채택 상태를 localStorage에 저장 (키: `onboarding.history.v1`)
- 형식이 바뀌면 키 버전을 올리고, 이전 데이터는 버립니다
