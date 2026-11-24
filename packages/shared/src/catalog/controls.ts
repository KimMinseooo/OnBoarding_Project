import type { FrameworkId } from '../schema/common';

// 컨트롤 이름 표 — 기준 문서: docs/06_frameworks.md#컨트롤-이름-표
// 순서: wpf, winform, python, react, node
const T = (wpf: string, winform: string, python: string, react: string, node: string) => ({ wpf, winform, python, react, node });

export const CONTROL_NAMES = {
  window: T('Window', 'Form', 'tk.Tk', '<App /> (Vite)', 'EJS 레이아웃'),
  menu: T('Menu', 'MenuStrip', 'tk.Menu', '<NavBar />', 'partials/header.ejs'),
  status: T('StatusBar', 'StatusStrip', 'ttk.Label (상태줄)', '<footer>', '<footer>'),
  group: T('GroupBox', 'GroupBox', 'ttk.LabelFrame', '<fieldset> / Card', '<fieldset>'),
  text: T('TextBox (TwoWay 바인딩)', 'TextBox', 'ttk.Entry', '<input />', '<input>'),
  combo: T('ComboBox', 'ComboBox', 'ttk.Combobox', '<select />', '<select>'),
  date: T('DatePicker', 'DateTimePicker', 'DateEntry (tkcalendar)', '<input type="date" />', '<input type="date">'),
  button: T('Button + Command', 'Button', 'ttk.Button', '<button />', '<button>'),
  radio: T('RadioButton', 'RadioButton', 'ttk.Radiobutton', 'radio <input />', 'radio <input>'),
  check: T('CheckBox', 'CheckBox', 'ttk.Checkbutton', 'checkbox <input />', 'checkbox <input>'),
  num: T('TextBox + RepeatButton', 'NumericUpDown', 'ttk.Spinbox', '<input type="number" />', '<input type="number">'),
  slider: T('Slider', 'TrackBar', 'ttk.Scale', '<input type="range" />', '<input type="range">'),
  progress: T('ProgressBar', 'ProgressBar', 'ttk.Progressbar', '<progress />', '<progress>'),
  result: T('TextBlock (바인딩)', 'Label', 'ttk.Label', '<output /> 영역', '결과 영역 (POST 후 렌더)'),
  list: T('ListBox', 'ListBox', 'tk.Listbox', '<ul> + map()', '<ul> + forEach'),
  checklist: T('ListBox + CheckBox', 'CheckedListBox', 'ttk.Checkbutton 목록', 'checkbox 목록 + map()', 'checkbox 목록'),
  tabs: T('TabControl', 'TabControl', 'ttk.Notebook', '<Tabs />', '탭 (?tab= 쿼리)'),
  steps: T('ItemsControl (단계 표시)', 'Panel + Label', 'ttk.Frame (단계 표시)', '<Stepper />', '단계 표시 (?step=)'),
  grid: T('DataGrid', 'DataGridView', 'ttk.Treeview', '<table />', '<table> + forEach'),
  detail: T('Grid (상세 폼)', 'Panel (상세 폼)', 'ttk.Frame (상세 폼)', '<DetailForm />', '<form>'),
  split: T('Grid + GridSplitter', 'SplitContainer', 'ttk.PanedWindow', 'CSS Grid 2열', '2열 레이아웃'),
  kanban: T('ItemsControl ×3', 'FlowLayoutPanel ×3', 'ttk.Frame ×3', '<KanbanColumn /> ×3', '상태별 열 (group by)'),
  card: T('Border (카드)', 'Panel (카드)', 'ttk.Frame (카드)', '<Card />', '카드 partial'),
  calendar: T('Grid (주간 시간표)', 'TableLayoutPanel', 'grid() 시간표', '<WeekCalendar /> (CSS Grid)', '<table> 주간 시간표'),
  dialog: T('Window.ShowDialog()', 'Form.ShowDialog()', 'tk.Toplevel (grab_set)', '<Modal />', '<dialog>'),
  chart: T('Canvas 막대 차트', 'Chart', 'tk.Canvas 막대 차트', '<BarChart />', 'GET /api/stats + 막대'),
  tree: T('TreeView', 'TreeView', 'ttk.Treeview (트리)', '<TreeNode /> (재귀)', '<details> 중첩'),
  ctx: T('ContextMenu', 'ContextMenuStrip', 'tk.Menu (popup)', 'onContextMenu 메뉴', 'contextmenu 이벤트 메뉴'),
} as const satisfies Record<string, Record<FrameworkId, string>>;

export type ControlKey = keyof typeof CONTROL_NAMES;
export const controlName = (fw: FrameworkId, key: ControlKey) => CONTROL_NAMES[key][fw];
