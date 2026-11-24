import type { LayoutId, Level } from '../schema/common';
import type { ControlKey } from './controls';

// 화면 유형 카탈로그 — 기준 문서: docs/07_layouts.md

export type Pin = { key: string; control: ControlKey; desc: string };
export type LayoutInfo = {
  id: LayoutId;
  name: string;
  level: Level;
  /** 중급은 이 값을 학습 목표로 사용 (초급은 Draft의 learningGoal) */
  learningGoal?: string;
  /** "필수 사용 컨트롤" 배지 */
  controls: ControlKey[];
  /** 예시 화면 주석 핀 (렌더러가 위치를 정함) */
  pins: Pin[];
};

const p = (key: string, control: ControlKey, desc: string): Pin => ({ key, control, desc });

export const LAYOUTS: Record<LayoutId, LayoutInfo> = {
  form: {
    id: 'form', name: '입력 폼 + 미리보기', level: 'basic',
    controls: ['window', 'group', 'text', 'combo', 'radio', 'check', 'date', 'num', 'result', 'button'],
    pins: [p('group', 'group', '입력 영역'), p('text', 'text', '텍스트 입력'), p('combo', 'combo', '목록에서 선택'), p('radio', 'radio', '하나만 선택'), p('check', 'check', '여러 개 선택'), p('date', 'date', '날짜 선택'), p('num', 'num', '숫자 입력'), p('result', 'result', '입력 내용 미리보기'), p('buttons', 'button', '초기화 / 제출')],
  },
  calc: {
    id: 'calc', name: '계산기형 도구', level: 'basic',
    controls: ['window', 'group', 'combo', 'num', 'date', 'radio', 'check', 'slider', 'button', 'result'],
    pins: [p('group', 'group', '입력 조건'), p('combo', 'combo', '선택 입력'), p('date', 'date', '날짜 입력'), p('num', 'num', '숫자 입력'), p('radio', 'radio', '하나만 선택'), p('check', 'check', '옵션'), p('slider', 'slider', '값 조절'), p('calcBtn', 'button', '계산 실행'), p('result', 'result', '계산 결과와 세부 내역')],
  },
  todo: {
    id: 'todo', name: '체크리스트', level: 'basic',
    controls: ['window', 'text', 'combo', 'button', 'radio', 'checklist', 'progress'],
    pins: [p('text', 'text', '할 일 입력'), p('combo', 'combo', '우선순위'), p('addBtn', 'button', '추가'), p('radio', 'radio', '목록 필터'), p('list', 'checklist', '완료 체크 목록 (클릭)'), p('progress', 'progress', '진행률'), p('buttons', 'button', '삭제')],
  },
  settings: {
    id: 'settings', name: '탭 설정 화면', level: 'basic',
    controls: ['window', 'tabs', 'combo', 'radio', 'check', 'slider', 'text', 'button'],
    pins: [p('tabs', 'tabs', '설정 분류 (탭 클릭)'), p('combo', 'combo', '선택 입력'), p('radio', 'radio', '하나만 선택'), p('check', 'check', '켜기 / 끄기'), p('slider', 'slider', '값 조절'), p('text', 'text', '경로 입력'), p('buttons', 'button', '취소 / 적용 / 확인')],
  },
  wizard: {
    id: 'wizard', name: '단계형 마법사', level: 'basic',
    controls: ['window', 'steps', 'group', 'text', 'combo', 'date', 'radio', 'check', 'progress', 'button'],
    pins: [p('steps', 'steps', '단계 표시 (클릭 가능)'), p('group', 'group', '현재 단계 입력'), p('text', 'text', '텍스트 입력'), p('combo', 'combo', '선택 입력'), p('date', 'date', '날짜 입력'), p('radio', 'radio', '하나만 선택'), p('check', 'check', '동의 체크'), p('progress', 'progress', '진행률'), p('buttons', 'button', '이전 / 다음 (클릭 가능)')],
  },
  lookup: {
    id: 'lookup', name: '검색 + 상세 조회', level: 'basic',
    controls: ['window', 'text', 'combo', 'list', 'group', 'button'],
    pins: [p('text', 'text', '검색어'), p('combo', 'combo', '부서 필터'), p('list', 'list', '검색 결과 (클릭)'), p('detail', 'group', '선택한 직원 상세'), p('buttons', 'button', '이메일 복사')],
  },
  gridForm: {
    id: 'gridForm', name: '그리드 + 하단 상세 폼', level: 'intermediate',
    learningGoal: '검색 조건 → 목록 → 상세 폼으로 이어지는 기본 CRUD 흐름과 DB 연동',
    controls: ['window', 'menu', 'group', 'combo', 'date', 'text', 'grid', 'detail', 'button', 'status'],
    pins: [p('search', 'group', '검색 조건'), p('combo', 'combo', '분류 필터'), p('date', 'date', '기간 2개'), p('grid', 'grid', '목록 (행 클릭)'), p('form', 'detail', '상세 입력'), p('buttons', 'button', '신규 · 등록 · 수정 · 삭제')],
  },
  masterDetail: {
    id: 'masterDetail', name: '마스터-디테일 (좌우 분할)', level: 'intermediate',
    learningGoal: '좌우 분할 레이아웃, 목록과 상세 탭의 선택 동기화, 하위 데이터 조회',
    controls: ['window', 'text', 'list', 'split', 'tabs', 'detail', 'grid', 'button'],
    pins: [p('text', 'text', '목록 검색'), p('list', 'list', '마스터 목록 (클릭)'), p('split', 'split', '영역 분할'), p('tabs', 'tabs', '상세 탭'), p('form', 'detail', '상세 입력'), p('mini', 'grid', '하위 목록'), p('buttons', 'button', '신규 · 저장 · 삭제')],
  },
  kanban: {
    id: 'kanban', name: '칸반 보드', level: 'intermediate',
    learningGoal: '상태별 그룹핑, 카드 선택, 상태 이동, 상세 패널 동기화',
    controls: ['window', 'text', 'combo', 'button', 'kanban', 'card', 'group'],
    pins: [p('text', 'text', '검색'), p('combo', 'combo', '담당자 필터'), p('addBtn', 'button', '등록'), p('lane', 'kanban', '상태별 열'), p('card', 'card', '항목 카드 (클릭)'), p('move', 'button', '다음 단계로 이동'), p('detail', 'group', '선택 카드 상세')],
  },
  calendar: {
    id: 'calendar', name: '주간 캘린더 + 대화상자', level: 'intermediate',
    learningGoal: '시간 → 좌표 배치 계산, 모달 대화상자로 등록·수정',
    controls: ['window', 'button', 'combo', 'calendar', 'card', 'dialog', 'text', 'date'],
    pins: [p('nav', 'button', '주 이동'), p('combo', 'combo', '회의실 필터'), p('addBtn', 'button', '새 예약'), p('cal', 'calendar', '주간 시간표'), p('event', 'card', '예약 블록 (클릭)'), p('dialog', 'dialog', '예약 수정 대화상자')],
  },
  dashboard: {
    id: 'dashboard', name: '대시보드 (요약 + 목록)', level: 'intermediate',
    learningGoal: '집계 쿼리, 요약 카드, 수치와 목록 동기화',
    controls: ['window', 'date', 'combo', 'button', 'card', 'chart', 'progress', 'grid'],
    pins: [p('date', 'date', '조회 기간'), p('addBtn', 'button', '등록'), p('cards', 'card', '요약 카드'), p('chart', 'chart', '주간 추이 차트 (선택)'), p('ratio', 'progress', '구분별 비율 (선택)'), p('grid', 'grid', '최근 내역 (행 클릭)')],
  },
  treeGrid: {
    id: 'treeGrid', name: '트리 + 그리드', level: 'intermediate',
    learningGoal: '계층 데이터 표시, 모달 등록 대화상자, 상태 변경 처리',
    controls: ['window', 'tree', 'text', 'button', 'grid', 'ctx', 'dialog'],
    pins: [p('tree', 'tree', '분류 트리'), p('text', 'text', '검색'), p('buttons', 'button', '등록 · 수정 · 삭제'), p('grid', 'grid', '목록 (행 클릭)'), p('rent', 'button', '상태 변경 버튼 (필수)'), p('ctx', 'ctx', '우클릭 메뉴 (선택)')],
  },
};
