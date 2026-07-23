import { act } from "react";

/**
 * CE 지연 렌더 플러시 — JdElement의 최초 render는 connectedCallback의 microtask,
 * 이후 requestUpdate가 microtask를 연쇄한다(웹 테스트의 tick 관례를 act로 감싼 형태).
 * act로 감싸 React 상태 갱신·이펙트도 같은 사이클에서 흡수한다.
 */
export const flushCE = (): Promise<void> =>
  act(
    () =>
      new Promise<void>((resolve) =>
        queueMicrotask(() => queueMicrotask(() => queueMicrotask(resolve))),
      ),
  );

/** act 없이 순수 microtask만 플러시 — React 루트가 없는 구간(SSR 마크업 → CE 업그레이드)용 */
export const rawTick = (): Promise<void> =>
  new Promise<void>((resolve) =>
    queueMicrotask(() => queueMicrotask(() => queueMicrotask(resolve))),
  );
