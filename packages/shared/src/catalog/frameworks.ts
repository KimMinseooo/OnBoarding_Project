import type { BasicLayoutId, CrudKey, FrameworkId, IntermediateLayoutId } from '../schema/common';

// 언어/프레임워크 카탈로그 — 기준 문서: docs/06_frameworks.md (값을 바꾸면 문서도 함께)
// 폴더 템플릿 자리표시자: {Entity} {entity} {entity_snake} {Logic} {logic} {logic_snake} {slug}

export type Skin = 'wpf' | 'winform' | 'tk' | 'web';

export type FrameworkInfo = {
  id: FrameworkId;
  label: string;
  kind: 'desktop' | 'web';
  skin: Skin;
  platform: string;
  firstLayout: { basic: BasicLayoutId; intermediate: IntermediateLayoutId };
  /** 데스크톱 메뉴 바 */
  menu?: string[];
  /** 웹 개발 주소 앞부분 (뒤에 /{slug}) */
  devHost?: string;
  basic: {
    how: string;
    tech: string[];
    hints: string[];
    exception: string;
    /** 화면 → (중간) → 로직 계층의 파일 템플릿 */
    folders: string[][];
  };
  intermediate: {
    how: string;
    tech: string[];
    exception: string;
    optional: string[];
    impl: Record<CrudKey, string>;
    advanced: Record<CrudKey, string>;
    folders: { presentation: string[]; business: string[]; data: string[]; common: string[] };
  };
};

export const FRAMEWORKS: Record<FrameworkId, FrameworkInfo> = {
  wpf: {
    id: 'wpf',
    label: 'C# WPF',
    kind: 'desktop',
    skin: 'wpf',
    platform: 'Windows 데스크톱 · WPF',
    firstLayout: { basic: 'form', intermediate: 'gridForm' },
    basic: {
      how: 'WPF로 구현하며 초급도 MVVM 패턴을 지켜야 합니다. 코드 비하인드(.xaml.cs)에는 InitializeComponent() 외의 로직을 두지 않습니다.',
      tech: ['MVVM 패턴', 'Data Binding (TwoWay)', 'ICommand (RelayCommand)', 'INotifyPropertyChanged', 'XAML 레이아웃 (Grid·StackPanel)'],
      hints: [
        '코드 비하인드에는 InitializeComponent()만 남기고, DataContext는 XAML에서 ViewModel로 연결',
        '버튼은 Click 이벤트 대신 Command 바인딩, 입력값은 TwoWay 바인딩으로 ViewModel 속성에 연결',
        '계산·검증은 Logic 클래스로 분리해 ViewModel에서 호출, 결과는 바인딩된 속성으로 표시',
        'ViewModel에서 MessageBox를 직접 부르지 말고 IDialogService 같은 인터페이스로 감싸기',
      ],
      exception: '오류 메시지는 ViewModel의 ErrorMessage 속성에 담아 바인딩으로 표시',
      folders: [
        ['MainWindow.xaml', 'MainWindow.xaml.cs (InitializeComponent만)'],
        ['ViewModels/MainViewModel.cs', 'ViewModels/ViewModelBase.cs', 'Commands/RelayCommand.cs'],
        ['Logic/{Logic}.cs'],
      ],
    },
    intermediate: {
      how: '이를 WPF와 MVVM 패턴의 데스크톱 프로그램으로 구현합니다.',
      tech: ['3-tier 구조', 'MVVM 패턴 (코드 비하인드 로직 금지)', 'Data Binding', 'ICommand', 'ObservableCollection', 'INotifyPropertyChanged', 'async/await', 'SQLite (EF Core)'],
      exception: 'IDataErrorInfo로 오류 입력란 테두리를 빨간색으로 표시',
      optional: ['조회 중 로딩 표시 (ProgressBar IsIndeterminate)'],
      impl: {
        R: '목록은 ObservableCollection에 바인딩, SelectedItem으로 상세 연결',
        C: '[등록]은 ICommand(RelayCommand)로 구현',
        U: '키 입력란은 IsReadOnly로 고정',
        D: 'MessageBox(예/아니오) 확인 후 삭제',
      },
      advanced: {
        R: '조회는 async 커맨드로 실행하고 진행 중 버튼 비활성화',
        C: 'Repository와 SQLite(EF Core)에 저장',
        U: '변경이 없으면 CanExecute로 저장 버튼 비활성화',
        D: '삭제 결과를 상태 표시줄에 표시',
      },
      folders: {
        presentation: ['Views/{Entity}View.xaml', 'ViewModels/{Entity}ViewModel.cs'],
        business: ['Services/I{Entity}Service.cs', 'Services/{Entity}Service.cs'],
        data: ['Repositories/I{Entity}Repository.cs', 'Repositories/{Entity}Repository.cs', 'Data/AppDbContext.cs'],
        common: ['Models/{Entity}.cs', 'Dtos/{Entity}Dto.cs'],
      },
    },
  },
  winform: {
    id: 'winform',
    label: 'C# WinForm',
    kind: 'desktop',
    skin: 'winform',
    platform: 'Windows 데스크톱 · WinForms',
    firstLayout: { basic: 'calc', intermediate: 'masterDetail' },
    menu: ['파일(F)', '편집(E)', '보기(V)', '도움말(H)'],
    basic: {
      how: 'WinForms 디자이너로 컨트롤을 배치하고 이벤트 핸들러로 동작을 구현합니다. DB는 쓰지 않습니다.',
      tech: ['디자이너로 폼 배치', '이벤트 핸들러 (Click·CheckedChanged)', '컨트롤 속성 (Text·Checked·Value)', '기본 입력 검증'],
      hints: [
        'Anchor·Dock 속성으로 창 크기 변화에 대응',
        'int.TryParse로 숫자 입력을 안전하게 변환',
        '검증 실패 시 MessageBox.Show와 Focus()로 안내',
      ],
      exception: 'try-catch로 예외를 잡고 MessageBox로 안내',
      folders: [['MainForm.cs (이벤트 처리)', 'MainForm.Designer.cs'], ['Logic/{Logic}.cs']],
    },
    intermediate: {
      how: '이를 WinForms 데스크톱 프로그램으로 구현합니다.',
      tech: ['3-tier 구조', 'BindingSource', 'DataTable', 'ADO.NET', '파라미터 쿼리', '3계층 구조 (UI·BLL·DAL)', 'ErrorProvider', 'async/await'],
      exception: 'ErrorProvider 아이콘으로 오류 위치 표시',
      optional: ['NPOI로 엑셀 내보내기'],
      impl: {
        R: '목록은 BindingSource로 DataTable에 연결',
        C: '[등록] 시 DB INSERT 후 목록 다시 조회',
        U: '키 TextBox는 ReadOnly',
        D: 'MessageBox 확인 후 삭제, 결과를 StatusStrip에 표시',
      },
      advanced: {
        R: '조건 검색은 파라미터 쿼리(LIKE)로 구현',
        C: 'UI·BLL·DAL 3계층으로 분리해 INSERT',
        U: '수정 전후 값을 비교해 변경이 없으면 저장 생략',
        D: '삭제는 트랜잭션으로 처리',
      },
      folders: {
        presentation: ['Forms/{Entity}Form.cs'],
        business: ['BLL/{Entity}Service.cs'],
        data: ['DAL/I{Entity}Repository.cs', 'DAL/{Entity}Repository.cs', 'DAL/DbHelper.cs'],
        common: ['Models/{Entity}.cs'],
      },
    },
  },
  react: {
    id: 'react',
    label: 'React',
    kind: 'web',
    skin: 'web',
    platform: '웹 브라우저 · React SPA',
    firstLayout: { basic: 'todo', intermediate: 'masterDetail' },
    devHost: 'localhost:5173',
    basic: {
      how: 'React로 구현하되, 서버 연동 없이 컴포넌트 상태(useState)만 사용합니다.',
      tech: ['JSX', 'useState', '이벤트 핸들링 (onChange·onClick)', '조건부 렌더링', '리스트 렌더링 (key)'],
      hints: [
        '입력값은 모두 controlled component로 관리',
        '계산 결과는 상태로 두지 말고 렌더링 중에 계산',
        '화면을 2~3개 컴포넌트로 나누고 props로 전달',
      ],
      exception: '잘못된 입력은 입력란 아래에 오류 문구로 표시',
      folders: [['src/App.jsx', 'src/components/*.jsx'], ['src/utils/{logic}.js']],
    },
    intermediate: {
      how: '이를 React 화면과 Mock API(json-server)로 구현합니다.',
      tech: ['3-tier 구조', 'useEffect + fetch', 'json-server Mock API', '컴포넌트 분리 / props', 'React Hook Form + Zod', 'TanStack Query', '커스텀 훅'],
      exception: 'API 실패 시 오류 배너와 재시도 버튼, 응답 지연 시 스켈레톤 표시',
      optional: ['낙관적 업데이트 (실패 시 롤백)', '필터 상태를 URL 쿼리스트링과 동기화'],
      impl: {
        R: 'useEffect로 목록 조회, 필터는 controlled input 상태로 관리',
        C: 'POST 성공 후 목록 갱신과 토스트',
        U: 'PUT 요청, 키 입력란은 disabled',
        D: '확인 모달 승인 후 DELETE 요청',
      },
      advanced: {
        R: 'TanStack Query로 캐싱·로딩·에러 상태 처리',
        C: 'React Hook Form + Zod로 폼 검증',
        U: '저장 중 버튼 비활성화, 실패 시 오류 표시',
        D: '삭제 후 invalidateQueries로 목록 갱신',
      },
      folders: {
        presentation: ['src/pages/{Entity}Page.jsx', 'src/components/{Entity}*.jsx'],
        business: ['src/hooks/use{Entity}s.js', 'src/services/{entity}Service.js'],
        data: ['src/api/{entity}Api.js', 'db.json (json-server)'],
        common: ['src/constants/{entity}.js'],
      },
    },
  },
  python: {
    id: 'python',
    label: 'Python',
    kind: 'desktop',
    skin: 'tk',
    platform: 'Tkinter (ttk clam 테마)',
    firstLayout: { basic: 'lookup', intermediate: 'gridForm' },
    menu: ['파일', '편집', '도움말'],
    basic: {
      how: 'Tkinter로 구현하며 DB 없이 메모리 안에서만 동작하면 됩니다.',
      tech: ['grid·pack 배치', 'command 콜백', 'StringVar·IntVar·BooleanVar', '기본 입력 검증'],
      hints: ['화면은 tk.Tk를 상속한 App 클래스로 구성', '입력값은 StringVar 등 변수 객체와 연결', '오류는 messagebox.showwarning으로 안내'],
      exception: 'ValueError 등 예외를 잡아 messagebox로 안내',
      folders: [['app.py (화면 구성·이벤트)'], ['logic/{logic_snake}.py']],
    },
    intermediate: {
      how: '이를 Tkinter와 sqlite3 기반 데스크톱 프로그램으로 구현합니다.',
      tech: ['3-tier 구조', 'sqlite3', '클래스 기반 화면 구성', '이벤트 바인딩 (bind)', 'dataclass 모델', 'Repository 분리', 'logging'],
      exception: 'DB 예외는 logging으로 기록하고 messagebox.showerror로 안내',
      optional: ['컬럼 헤더 클릭 정렬', '상태별 행 색상', 'ttkbootstrap 등으로 테마 적용'],
      impl: {
        R: 'Treeview 등 목록 위젯에 결과 표시, 선택 이벤트로 상세 채움',
        C: 'sqlite3 INSERT 후 목록 새로고침',
        U: '키 Entry는 state="readonly"',
        D: 'messagebox.askyesno 확인 후 삭제',
      },
      advanced: {
        R: '검색 조건은 SQL 파라미터 바인딩(?)으로 전달',
        C: 'dataclass 모델과 Repository로 분리',
        U: 'validatecommand로 입력 중 검증',
        D: 'logging으로 삭제 이력 기록',
      },
      folders: {
        presentation: ['ui/{entity_snake}_view.py'],
        business: ['services/{entity_snake}_service.py'],
        data: ['repositories/{entity_snake}_repository.py', 'db.py'],
        common: ['models/{entity_snake}.py (dataclass)'],
      },
    },
  },
  node: {
    id: 'node',
    label: 'NodeJS',
    kind: 'web',
    skin: 'web',
    platform: '웹 브라우저 · Express + EJS',
    firstLayout: { basic: 'form', intermediate: 'masterDetail' },
    devHost: 'localhost:3000',
    basic: {
      how: 'Express와 EJS로 구현하며, 폼을 POST로 받아 결과 페이지를 렌더링합니다. DB는 쓰지 않습니다.',
      tech: ['Express 라우팅 (GET·POST)', 'EJS 템플릿', 'express.urlencoded로 폼 처리', 'res.render로 결과 표시'],
      hints: [
        'GET은 빈 화면, POST는 처리 결과를 같은 템플릿으로 렌더링',
        '입력값 검증은 라우트 핸들러에서 직접 처리',
        '공통 레이아웃은 EJS include로 분리',
      ],
      exception: '잘못된 요청은 400 상태와 함께 오류 메시지를 화면에 표시',
      folders: [['routes/index.js', 'views/*.ejs'], ['lib/{logic}.js']],
    },
    intermediate: {
      how: '이를 Express REST API와 EJS 관리자 화면으로 구현합니다.',
      tech: ['3-tier 구조', 'REST API (GET·POST·PUT·DELETE)', 'MVC 폴더 구조', 'better-sqlite3', '미들웨어', 'express-validator', 'HTTP 상태 코드'],
      exception: '공통 에러 핸들러로 { code, message } 형식 통일',
      optional: ['JWT 인증 (관리자만 삭제)', 'Swagger로 API 문서 자동 생성', '페이지네이션 (page·size)'],
      impl: {
        R: 'GET /api/{slug} — 쿼리로 검색·필터',
        C: 'POST /api/{slug} — 201과 생성된 리소스 반환',
        U: 'PUT /api/{slug}/:id — 없는 id는 404',
        D: 'DELETE /api/{slug}/:id — 성공 시 204',
      },
      advanced: {
        R: '검색 조건은 SQL 파라미터 바인딩으로 전달',
        C: 'express-validator로 요청 본문 검증',
        U: 'PATCH로 상태만 바꾸는 API 추가',
        D: '없는 id 삭제는 404, 성공은 204로 구분',
      },
      folders: {
        presentation: ['routes/{entity}Routes.js', 'controllers/{entity}Controller.js', 'views/{entity}/*.ejs'],
        business: ['services/{entity}Service.js'],
        data: ['repositories/{entity}Repository.js', 'db/index.js'],
        common: ['dto/{entity}Dto.js'],
      },
    },
  },
};
