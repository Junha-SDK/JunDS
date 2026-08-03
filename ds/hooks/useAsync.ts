"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncStatus = "idle" | "pending" | "success" | "error";

export interface UseAsyncResult<T, A extends unknown[]> {
  /** 현재 상태 */
  status: AsyncStatus;
  /** 마지막 성공 데이터 */
  data: T | null;
  /** 마지막 에러 */
  error: Error | null;
  /** 진행 중 여부 */
  isLoading: boolean;
  /** 호출 (race condition 가드 포함) */
  execute: (...args: A) => Promise<T | undefined>;
  /** 상태 초기화 */
  reset: () => void;
}

export interface UseAsyncOptions {
  /** 마운트 즉시 실행 (인자 없는 함수일 때만 의미 있음) */
  immediate?: boolean;
}

/**
 * Promise 호출 상태 관리 + 마지막 호출만 반영하는 race-condition 가드.
 * @example
 * const { execute, data, isLoading, error } = useAsync(api.fetchUser);
 * useEffect(() => { execute(userId); }, [userId]);
 */
export function useAsync<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  { immediate = false }: UseAsyncOptions = {},
): UseAsyncResult<T, A> {
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const callIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: A) => {
      const id = ++callIdRef.current;
      setStatus("pending");
      setError(null);
      try {
        const result = await fn(...args);
        if (id === callIdRef.current && mountedRef.current) {
          setData(result);
          setStatus("success");
        }
        return result;
      } catch (e) {
        if (id === callIdRef.current && mountedRef.current) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setStatus("error");
        }
        return undefined;
      }
    },
    [fn],
  );

  const reset = useCallback(() => {
    callIdRef.current++;
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      void (execute as unknown as () => Promise<unknown>)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, data, error, isLoading: status === "pending", execute, reset };
}
