"use client";
import { useCallback, useRef, useState } from "react";

/**
 * 옵티미스틱 업데이트 훅 — 서버 응답 전에 UI를 즉시 반영하고, 실패 시
 * 자동 rollback. React 19의 `useOptimistic`보다 단순한 reducer-free 인터페이스.
 *
 * @example
 *   const [posts, optimistic] = useOptimisticState(serverPosts);
 *   const like = (id: string) =>
 *     optimistic.run(
 *       () => posts.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p),
 *       () => api.like(id),
 *     );
 */

export interface OptimisticController<T> {
  /** 옵티미스틱 업데이트 + 실제 mutation 트리거. 실패 시 자동 롤백. */
  run: (apply: (current: T) => T, mutation: () => Promise<unknown>) => Promise<void>;
  /** 진행 중 mutation 카운트 */
  pendingCount: number;
}

export function useOptimisticState<T>(initial: T): [T, OptimisticController<T>, (next: T) => void] {
  const [state, setState] = useState<T>(initial);
  const truthRef = useRef<T>(initial);
  const [pendingCount, setPendingCount] = useState(0);

  const setTruth = useCallback((next: T) => {
    truthRef.current = next;
    setState(next);
  }, []);

  const run = useCallback(
    async (apply: (current: T) => T, mutation: () => Promise<unknown>) => {
      const before = truthRef.current;
      const optimistic = apply(before);
      setState(optimistic);
      setPendingCount((n) => n + 1);
      try {
        await mutation();
        truthRef.current = optimistic;
      } catch (e) {
        // Rollback to last-known-truth.
        setState(truthRef.current);
        throw e;
      } finally {
        setPendingCount((n) => n - 1);
      }
    },
    [],
  );

  return [state, { run, pendingCount }, setTruth];
}
