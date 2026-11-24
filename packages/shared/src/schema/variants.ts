import { z } from 'zod';
import type { LayoutId } from './common';
import { MOCKUP_DATA_SCHEMAS } from './mockup';

/**
 * 화면 유형마다 mockup.data 형식이 달라서, layout 값으로 구분하는 12개 변형을 만듭니다.
 * (Draft와 Assignment가 같은 방식을 씁니다)
 */
export function layoutVariants<S extends z.ZodRawShape, M extends z.ZodRawShape>(shape: S, mockupShape: M) {
  const v = <L extends LayoutId>(layout: L) =>
    z.object({
      ...shape,
      layout: z.literal(layout),
      mockup: z.object({ ...mockupShape, data: MOCKUP_DATA_SCHEMAS[layout] }),
    });
  return [
    v('form'),
    v('calc'),
    v('todo'),
    v('settings'),
    v('wizard'),
    v('lookup'),
    v('gridForm'),
    v('masterDetail'),
    v('kanban'),
    v('calendar'),
    v('dashboard'),
    v('treeGrid'),
  ] as const;
}
