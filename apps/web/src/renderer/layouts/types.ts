import type { ReactNode } from 'react';
import type { Assignment, MockupDataMap } from '@obp/shared';
import type { Pos, Skin } from '../kit';

export type Box = { x: number; y: number; w: number };
export type LayoutCtx<L extends keyof MockupDataMap> = {
  k: Skin;
  a: Assignment;
  d: MockupDataMap[L];
  sel: number;
  setSel: (i: number) => void;
};
export type LayoutResult = { els: ReactNode[]; pos: Pos; h: number; status: string };
export type LayoutFn<L extends keyof MockupDataMap> = (c: LayoutCtx<L>, b: Box) => LayoutResult;
