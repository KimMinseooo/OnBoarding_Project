import type { LayoutId } from '@obp/shared';
import { calc, form, lookup, settings, todo, wizard } from './basic';
import { calendar, dashboard, gridForm, kanban, masterDetail, treeGrid } from './intermediate';
import type { LayoutFn } from './types';

export const LAYOUT_RENDERERS: { [K in LayoutId]: LayoutFn<K> } = {
  form,
  calc,
  todo,
  settings,
  wizard,
  lookup,
  gridForm,
  masterDetail,
  kanban,
  calendar,
  dashboard,
  treeGrid,
};
