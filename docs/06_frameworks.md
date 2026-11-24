# 06. 언어/프레임워크 카탈로그

> 최종 수정일: 2026-11-24
> 코드 위치: `packages/shared/catalog/frameworks`

프레임워크별로 과제에 들어가는 **구체 값**입니다. 정책(왜 이렇게 하는지)은 [05](05_assignment-rules.md)에 있습니다.
템플릿의 `{Entity}`는 업무 엔터티의 영문 이름(예: `Asset`), `{entity}`는 첫 글자 소문자, `{entity_snake}`는 스네이크 표기, `{Logic}`은 초급 로직 클래스 이름(예: `TripCostCalculator`)입니다.

## 요약

| ID | 표시 이름 | 플랫폼(스킨) | 첫 제안 (초급 / 중급) |
|---|---|---|---|
| `wpf` | C# WPF | Windows 데스크톱 · WPF | form / gridForm |
| `winform` | C# WinForm | Windows 데스크톱 · WinForms | calc / masterDetail |
| `react` | React | 웹 브라우저 · React SPA | todo / masterDetail |
| `python` | Python | Tkinter (ttk clam 테마) | lookup / gridForm |
| `node` | NodeJS | 웹 브라우저 · Express + EJS | form / masterDetail |

---

## wpf — C# WPF

**초급도 MVVM 필수** ([05](05_assignment-rules.md#코드-구조-원칙))

| 항목 | 초급 | 중급 |
|---|---|---|
| 구현 방식 문장 | WPF로 구현하며 초급도 MVVM 패턴을 지켜야 합니다. 코드 비하인드(.xaml.cs)에는 InitializeComponent() 외의 로직을 두지 않습니다. | 이를 WPF와 MVVM 패턴의 데스크톱 프로그램으로 구현합니다. |
| 핵심 기술 | MVVM 패턴, Data Binding (TwoWay), ICommand (RelayCommand), INotifyPropertyChanged, XAML 레이아웃 (Grid·StackPanel) | 3-tier 구조, MVVM 패턴 (코드 비하인드 로직 금지), Data Binding, ICommand, ObservableCollection, INotifyPropertyChanged, async/await, SQLite (EF Core) |
| 공통 예외 조건 | 오류 메시지는 ViewModel의 ErrorMessage 속성에 담아 바인딩으로 표시 | IDataErrorInfo로 오류 입력란 테두리를 빨간색으로 표시 |
| 선택 기능 | — | 조회 중 로딩 표시 (ProgressBar IsIndeterminate) |

**초급 구현 힌트**
- 코드 비하인드에는 InitializeComponent()만 남기고, DataContext는 XAML에서 ViewModel로 연결
- 버튼은 Click 이벤트 대신 Command 바인딩, 입력값은 TwoWay 바인딩으로 ViewModel 속성에 연결
- 계산·검증은 Logic 클래스로 분리해 ViewModel에서 호출, 결과는 바인딩된 속성으로 표시
- ViewModel에서 MessageBox를 직접 부르지 말고 IDialogService 같은 인터페이스로 감싸기

**중급 CRUD 구현 포인트**

| | 기본 | 중급 심화 |
|---|---|---|
| R | 목록은 ObservableCollection에 바인딩, SelectedItem으로 상세 연결 | 조회는 async 커맨드로 실행하고 진행 중 버튼 비활성화 |
| C | [등록]은 ICommand(RelayCommand)로 구현 | Repository와 SQLite(EF Core)에 저장 |
| U | 키 입력란은 IsReadOnly로 고정 | 변경이 없으면 CanExecute로 저장 버튼 비활성화 |
| D | MessageBox(예/아니오) 확인 후 삭제 | 삭제 결과를 상태 표시줄에 표시 |

**폴더 템플릿**

| 계층 | 초급 (View / ViewModel / Logic) | 중급 (3-tier) |
|---|---|---|
| 화면 | `MainWindow.xaml`, `MainWindow.xaml.cs` (InitializeComponent만) | `Views/{Entity}View.xaml`, `ViewModels/{Entity}ViewModel.cs` |
| 중간 | `ViewModels/MainViewModel.cs`, `ViewModels/ViewModelBase.cs`, `Commands/RelayCommand.cs` | `Services/I{Entity}Service.cs`, `Services/{Entity}Service.cs` |
| 하위 | `Logic/{Logic}.cs` | `Repositories/I{Entity}Repository.cs`, `Repositories/{Entity}Repository.cs`, `Data/AppDbContext.cs` |
| 공통 | — | `Models/{Entity}.cs`, `Dtos/{Entity}Dto.cs` |

---

## winform — C# WinForm

| 항목 | 초급 | 중급 |
|---|---|---|
| 구현 방식 문장 | WinForms 디자이너로 컨트롤을 배치하고 이벤트 핸들러로 동작을 구현합니다. DB는 쓰지 않습니다. | 이를 WinForms 데스크톱 프로그램으로 구현합니다. |
| 핵심 기술 | 디자이너로 폼 배치, 이벤트 핸들러 (Click·CheckedChanged), 컨트롤 속성 (Text·Checked·Value), 기본 입력 검증 | 3-tier 구조, BindingSource, DataTable, ADO.NET, 파라미터 쿼리, 3계층 구조 (UI·BLL·DAL), ErrorProvider, async/await |
| 공통 예외 조건 | try-catch로 예외를 잡고 MessageBox로 안내 | ErrorProvider 아이콘으로 오류 위치 표시 |
| 메뉴 바 | 파일(F), 편집(E), 보기(V), 도움말(H) | 같음 |
| 선택 기능 | — | NPOI로 엑셀 내보내기 |

**초급 구현 힌트**
- Anchor·Dock 속성으로 창 크기 변화에 대응
- int.TryParse로 숫자 입력을 안전하게 변환
- 검증 실패 시 MessageBox.Show와 Focus()로 안내

**중급 CRUD 구현 포인트**

| | 기본 | 중급 심화 |
|---|---|---|
| R | 목록은 BindingSource로 DataTable에 연결 | 조건 검색은 파라미터 쿼리(LIKE)로 구현 |
| C | [등록] 시 DB INSERT 후 목록 다시 조회 | UI·BLL·DAL 3계층으로 분리해 INSERT |
| U | 키 TextBox는 ReadOnly | 수정 전후 값을 비교해 변경이 없으면 저장 생략 |
| D | MessageBox 확인 후 삭제, 결과를 StatusStrip에 표시 | 삭제는 트랜잭션으로 처리 |

**폴더 템플릿**

| 계층 | 초급 | 중급 |
|---|---|---|
| 화면 | `MainForm.cs` (이벤트 처리), `MainForm.Designer.cs` | `Forms/{Entity}Form.cs` |
| 업무 | `Logic/{Logic}.cs` | `BLL/{Entity}Service.cs` |
| 데이터 | — | `DAL/I{Entity}Repository.cs`, `DAL/{Entity}Repository.cs`, `DAL/DbHelper.cs` |
| 공통 | — | `Models/{Entity}.cs` |

---

## react — React

| 항목 | 초급 | 중급 |
|---|---|---|
| 구현 방식 문장 | React로 구현하되, 서버 연동 없이 컴포넌트 상태(useState)만 사용합니다. | 이를 React 화면과 Mock API(json-server)로 구현합니다. |
| 핵심 기술 | JSX, useState, 이벤트 핸들링 (onChange·onClick), 조건부 렌더링, 리스트 렌더링 (key) | 3-tier 구조, useEffect + fetch, json-server Mock API, 컴포넌트 분리 / props, React Hook Form + Zod, TanStack Query, 커스텀 훅 |
| 공통 예외 조건 | 잘못된 입력은 입력란 아래에 오류 문구로 표시 | API 실패 시 오류 배너와 재시도 버튼, 응답 지연 시 스켈레톤 표시 |
| 개발 주소 | `localhost:5173/{slug}` | 같음 |
| 선택 기능 | — | 낙관적 업데이트 (실패 시 롤백), 필터 상태를 URL 쿼리스트링과 동기화 |

**초급 구현 힌트**
- 입력값은 모두 controlled component로 관리
- 계산 결과는 상태로 두지 말고 렌더링 중에 계산
- 화면을 2~3개 컴포넌트로 나누고 props로 전달

**중급 CRUD 구현 포인트**

| | 기본 | 중급 심화 |
|---|---|---|
| R | useEffect로 목록 조회, 필터는 controlled input 상태로 관리 | TanStack Query로 캐싱·로딩·에러 상태 처리 |
| C | POST 성공 후 목록 갱신과 토스트 | React Hook Form + Zod로 폼 검증 |
| U | PUT 요청, 키 입력란은 disabled | 저장 중 버튼 비활성화, 실패 시 오류 표시 |
| D | 확인 모달 승인 후 DELETE 요청 | 삭제 후 invalidateQueries로 목록 갱신 |

**폴더 템플릿**

| 계층 | 초급 | 중급 |
|---|---|---|
| 화면 | `src/App.jsx`, `src/components/*.jsx` | `src/pages/{Entity}Page.jsx`, `src/components/{Entity}*.jsx` |
| 업무 | `src/utils/{logic}.js` | `src/hooks/use{Entity}s.js`, `src/services/{entity}Service.js` |
| 데이터 | — | `src/api/{entity}Api.js`, `db.json` (json-server) |
| 공통 | — | `src/constants/{entity}.js` |

> React는 프론트엔드 안에서의 계층 분리입니다. 실제 DB 역할은 json-server가 맡습니다.

---

## python — Python (Tkinter)

| 항목 | 초급 | 중급 |
|---|---|---|
| 구현 방식 문장 | Tkinter로 구현하며 DB 없이 메모리 안에서만 동작하면 됩니다. | 이를 Tkinter와 sqlite3 기반 데스크톱 프로그램으로 구현합니다. |
| 핵심 기술 | grid·pack 배치, command 콜백, StringVar·IntVar·BooleanVar, 기본 입력 검증 | 3-tier 구조, sqlite3, 클래스 기반 화면 구성, 이벤트 바인딩 (bind), dataclass 모델, Repository 분리, logging |
| 공통 예외 조건 | ValueError 등 예외를 잡아 messagebox로 안내 | DB 예외는 logging으로 기록하고 messagebox.showerror로 안내 |
| 메뉴 바 | 파일, 편집, 도움말 | 같음 |
| 선택 기능 | — | 컬럼 헤더 클릭 정렬, 상태별 행 색상, ttkbootstrap 등으로 테마 적용 |

**초급 구현 힌트**
- 화면은 tk.Tk를 상속한 App 클래스로 구성
- 입력값은 StringVar 등 변수 객체와 연결
- 오류는 messagebox.showwarning으로 안내

**중급 CRUD 구현 포인트**

| | 기본 | 중급 심화 |
|---|---|---|
| R | Treeview 등 목록 위젯에 결과 표시, 선택 이벤트로 상세 채움 | 검색 조건은 SQL 파라미터 바인딩(`?`)으로 전달 |
| C | sqlite3 INSERT 후 목록 새로고침 | dataclass 모델과 Repository로 분리 |
| U | 키 Entry는 state="readonly" | validatecommand로 입력 중 검증 |
| D | messagebox.askyesno 확인 후 삭제 | logging으로 삭제 이력 기록 |

**폴더 템플릿**

| 계층 | 초급 | 중급 |
|---|---|---|
| 화면 | `app.py` (화면 구성·이벤트) | `ui/{entity_snake}_view.py` |
| 업무 | `logic/{logic_snake}.py` | `services/{entity_snake}_service.py` |
| 데이터 | — | `repositories/{entity_snake}_repository.py`, `db.py` |
| 공통 | — | `models/{entity_snake}.py` (dataclass) |

---

## node — NodeJS (Express + EJS)

| 항목 | 초급 | 중급 |
|---|---|---|
| 구현 방식 문장 | Express와 EJS로 구현하며, 폼을 POST로 받아 결과 페이지를 렌더링합니다. DB는 쓰지 않습니다. | 이를 Express REST API와 EJS 관리자 화면으로 구현합니다. |
| 핵심 기술 | Express 라우팅 (GET·POST), EJS 템플릿, express.urlencoded로 폼 처리, res.render로 결과 표시 | 3-tier 구조, REST API (GET·POST·PUT·DELETE), MVC 폴더 구조, better-sqlite3, 미들웨어, express-validator, HTTP 상태 코드 |
| 공통 예외 조건 | 잘못된 요청은 400 상태와 함께 오류 메시지를 화면에 표시 | 공통 에러 핸들러로 `{ code, message }` 형식 통일 |
| 개발 주소 | `localhost:3000/{slug}` | 같음 |
| 선택 기능 | — | JWT 인증 (관리자만 삭제), Swagger로 API 문서 자동 생성, 페이지네이션 (page·size) |

**초급 구현 힌트**
- GET은 빈 화면, POST는 처리 결과를 같은 템플릿으로 렌더링
- 입력값 검증은 라우트 핸들러에서 직접 처리
- 공통 레이아웃은 EJS include로 분리

**중급 CRUD 구현 포인트**

| | 기본 | 중급 심화 |
|---|---|---|
| R | `GET /api/{slug}` — 쿼리로 검색·필터 | 검색 조건은 SQL 파라미터 바인딩으로 전달 |
| C | `POST /api/{slug}` — 201과 생성된 리소스 반환 | express-validator로 요청 본문 검증 |
| U | `PUT /api/{slug}/:id` — 없는 id는 404 | PATCH로 상태만 바꾸는 API 추가 |
| D | `DELETE /api/{slug}/:id` — 성공 시 204 | 없는 id 삭제는 404, 성공은 204로 구분 |

**폴더 템플릿**

| 계층 | 초급 | 중급 |
|---|---|---|
| 화면 | `routes/index.js`, `views/*.ejs` | `routes/{entity}Routes.js`, `controllers/{entity}Controller.js`, `views/{entity}/*.ejs` |
| 업무 | `lib/{logic}.js` | `services/{entity}Service.js` |
| 데이터 | — | `repositories/{entity}Repository.js`, `db/index.js` |
| 공통 | — | `dto/{entity}Dto.js` |

---

## 컨트롤 이름 표

예시 화면의 주석과 "필수 사용 컨트롤" 배지에 쓰는 이름입니다. 왼쪽 키는 [07](07_layouts.md)에서 씁니다.

| 키 | wpf | winform | python | react | node |
|---|---|---|---|---|---|
| window | Window | Form | tk.Tk | `<App />` (Vite) | EJS 레이아웃 |
| menu | Menu | MenuStrip | tk.Menu | `<NavBar />` | partials/header.ejs |
| status | StatusBar | StatusStrip | ttk.Label (상태줄) | `<footer>` | `<footer>` |
| group | GroupBox | GroupBox | ttk.LabelFrame | `<fieldset>` / Card | `<fieldset>` |
| text | TextBox (TwoWay 바인딩) | TextBox | ttk.Entry | `<input />` | `<input>` |
| combo | ComboBox | ComboBox | ttk.Combobox | `<select />` | `<select>` |
| date | DatePicker | DateTimePicker | DateEntry (tkcalendar) | `<input type="date" />` | `<input type="date">` |
| button | Button + Command | Button | ttk.Button | `<button />` | `<button>` |
| radio | RadioButton | RadioButton | ttk.Radiobutton | radio `<input />` | radio `<input>` |
| check | CheckBox | CheckBox | ttk.Checkbutton | checkbox `<input />` | checkbox `<input>` |
| num | TextBox + RepeatButton | NumericUpDown | ttk.Spinbox | `<input type="number" />` | `<input type="number">` |
| slider | Slider | TrackBar | ttk.Scale | `<input type="range" />` | `<input type="range">` |
| progress | ProgressBar | ProgressBar | ttk.Progressbar | `<progress />` | `<progress>` |
| result | TextBlock (바인딩) | Label | ttk.Label | `<output />` 영역 | 결과 영역 (POST 후 렌더) |
| list | ListBox | ListBox | tk.Listbox | `<ul>` + map() | `<ul>` + forEach |
| checklist | ListBox + CheckBox | CheckedListBox | ttk.Checkbutton 목록 | checkbox 목록 + map() | checkbox 목록 |
| tabs | TabControl | TabControl | ttk.Notebook | `<Tabs />` | 탭 (?tab= 쿼리) |
| steps | ItemsControl (단계 표시) | Panel + Label | ttk.Frame (단계 표시) | `<Stepper />` | 단계 표시 (?step=) |
| grid | DataGrid | DataGridView | ttk.Treeview | `<table />` | `<table>` + forEach |
| detail | Grid (상세 폼) | Panel (상세 폼) | ttk.Frame (상세 폼) | `<DetailForm />` | `<form>` |
| split | Grid + GridSplitter | SplitContainer | ttk.PanedWindow | CSS Grid 2열 | 2열 레이아웃 |
| kanban | ItemsControl ×3 | FlowLayoutPanel ×3 | ttk.Frame ×3 | `<KanbanColumn />` ×3 | 상태별 열 (group by) |
| card | Border (카드) | Panel (카드) | ttk.Frame (카드) | `<Card />` | 카드 partial |
| calendar | Grid (주간 시간표) | TableLayoutPanel | grid() 시간표 | `<WeekCalendar />` (CSS Grid) | `<table>` 주간 시간표 |
| dialog | Window.ShowDialog() | Form.ShowDialog() | tk.Toplevel (grab_set) | `<Modal />` | `<dialog>` |
| chart | Canvas 막대 차트 | Chart | tk.Canvas 막대 차트 | `<BarChart />` | GET /api/stats + 막대 |
| tree | TreeView | TreeView | ttk.Treeview (트리) | `<TreeNode />` (재귀) | `<details>` 중첩 |
| ctx | ContextMenu | ContextMenuStrip | tk.Menu (popup) | onContextMenu 메뉴 | contextmenu 이벤트 메뉴 |

## 프레임워크 추가 방법

1. 이 문서에 새 섹션과 컨트롤 이름 표의 열을 추가
2. 예시 화면 스킨을 정함 (기존 스킨 재사용 가능)
3. `packages/shared/catalog/frameworks`에 반영
4. [09_decisions](09_decisions.md)에 기록
