"use client";
import { useEffect, useRef, type DependencyList, type EffectCallback } from "react";

/**
 * useEffect와 동일하나 마운트 시점은 건너뛰고 deps 갱신부터 동작.
 * @example
 * useUpdateEffect(() => { onChange(value); }, [value]);
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
