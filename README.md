# 신입사원 온보딩 과제 생성기

신입사원이 실무에 들어가기 전, 선택한 언어/프레임워크와 난이도에 맞는 **실무형 과제(개발 명세서 + 구현 목표 예시 화면 + 채점표)**를 Claude API로 생성해 주는 웹 애플리케이션입니다.

- 확정된 UI 목업: [`mockup/onboarding-mockup.html`](mockup/onboarding-mockup.html) (브라우저로 열어서 확인)
- 진행 순서: [`docs/00_roadmap.md`](docs/00_roadmap.md)
- 작업 방법(Claude·개발자 공통 지침): [`CLAUDE.md`](CLAUDE.md)

---

## 문서 지도

**한 가지 내용은 한 문서에만** 적습니다. 무엇을 바꾸려는지에 따라 아래 표에서 고칠 문서를 찾으세요.

| 문서 | 담당하는 내용 | 이런 변경이 생기면 여기를 수정 |
|---|---|---|
| [00_roadmap](docs/00_roadmap.md) | 개발 단계, 단계별 작업과 완료 기준 | 일정·진행 순서 변경 |
| [01_product](docs/01_product.md) | 목적, 사용자, 범위(MVP/백로그), 용어 | 기능을 넣거나 뺄 때 |
| [02_ui-spec](docs/02_ui-spec.md) | 화면 영역, 버튼 동작, 제안 상태 흐름 | 화면·상호작용 변경 |
| [03_architecture](docs/03_architecture.md) | 기술 스택, 폴더 구조, 데이터 흐름, 내부 API | 기술 선택·구조 변경 |
| [04_assignment-schema](docs/04_assignment-schema.md) | 과제 데이터(JSON) 형식과 검증 규칙 | 과제에 항목을 추가·변경할 때 |
| [05_assignment-rules](docs/05_assignment-rules.md) | 난이도 정의, 필수/선택 원칙, 코드 구조 원칙, 채점 배점, 소요 기간 | 과제 **정책** 변경 |
| [06_frameworks](docs/06_frameworks.md) | 언어/프레임워크별 기술·힌트·폴더 템플릿·컨트롤 이름 | 프레임워크 추가·수정 |
| [07_layouts](docs/07_layouts.md) | 화면 유형 12종의 구성과 필수/선택 기능 | 화면 유형 추가·수정 |
| [08_prompt](docs/08_prompt.md) | Claude API 프롬프트, 출력 검증, 재시도 | 생성 품질 개선 |
| [09_decisions](docs/09_decisions.md) | 지금까지의 결정과 이유 | 정책·구조를 바꿀 때 기록 추가 |

## 문서 관리 규칙

1. **단일 출처**: 같은 사실을 두 문서에 쓰지 않습니다. 필요하면 링크로 가리킵니다.
   - 예) 채점 배점은 05에만 있고, 02·08은 "05 참고"라고만 씁니다.
2. **정책을 바꿀 때**: 해당 문서를 고치고, [09_decisions](docs/09_decisions.md)에 결정 기록을 한 줄 추가합니다.
3. **데이터 형식을 바꿀 때**: [04](docs/04_assignment-schema.md)를 먼저 고친 뒤 코드를 고칩니다.
4. **카탈로그(06·07)와 코드**: 문서가 기준입니다. 코드의 카탈로그 상수(`packages/shared/catalog`)는 문서를 옮긴 것이므로, 둘을 함께 수정합니다.
5. 각 문서 맨 위의 **최종 수정일**을 갱신합니다.

## 빠른 시작

```bash
npm install              # Node 22.12 이상
cp .env.example .env     # 처음 한 번 (Mock 모드는 키 없이 동작)
npm run dev              # http://localhost:5173
```
사내 서버 배포는 [03_architecture](docs/03_architecture.md#배포), Vercel 배포는 [03_architecture](docs/03_architecture.md#vercel-배포). 명령어 전체 목록은 [CLAUDE.md](CLAUDE.md#명령어), 폴더 구조는 [03_architecture](docs/03_architecture.md#폴더-구조)를 봅니다.
