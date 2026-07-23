import type { Ref } from "react";

/** ref 합성 — v2 utils/Slot.tsx의 composeRefs를 어댑터 공용으로 분리한 사본. */
export function composeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> | undefined {
  const filtered = refs.filter(Boolean) as Array<Ref<T>>;
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return (node: T) => {
    for (const ref of filtered) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as { current: T | null }).current = node;
      }
    }
  };
}
