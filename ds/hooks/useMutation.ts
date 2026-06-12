"use client";
import { useCallback, useState } from "react";
import { invalidateResource } from "./useResource";

/**
 * 비동기 변형(mutation) 작업의 상태 관리. POST/PUT/DELETE 흐름 표준화.
 * `invalidates`로 관련 리소스 캐시를 자동 무효화한다.
 *
 * @example
 *   const { mutate, loading } = useMutation(
 *     (postId: string) => fetch(`/api/posts/${postId}/like`, { method: "POST" }),
 *     { invalidates: [["posts"]] },
 *   );
 *   <LikeButton onChange={() => mutate(post.id)} loading={loading} />
 */

export interface UseMutationOptions<TInput, TResult> {
  /** 성공 시 호출 */
  onSuccess?: (result: TResult, input: TInput) => void;
  /** 실패 시 호출 */
  onError?: (error: Error, input: TInput) => void;
  /** 성공 후 무효화할 useResource 키들 */
  invalidates?: unknown[][];
}

export interface UseMutationResult<TInput, TResult> {
  mutate: (input: TInput) => Promise<TResult>;
  data: TResult | undefined;
  error: Error | undefined;
  loading: boolean;
  /** 마지막 결과/에러 초기화 */
  reset: () => void;
}

export function useMutation<TInput = void, TResult = unknown>(
  mutationFn: (input: TInput) => Promise<TResult>,
  { onSuccess, onError, invalidates = [] }: UseMutationOptions<TInput, TResult> = {},
): UseMutationResult<TInput, TResult> {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (input: TInput) => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await mutationFn(input);
        setData(result);
        for (const key of invalidates) invalidateResource(key);
        onSuccess?.(result, input);
        return result;
      } catch (e) {
        const err = e as Error;
        setError(err);
        onError?.(err, input);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutationFn],
  );

  return {
    mutate,
    data,
    error,
    loading,
    reset: () => {
      setData(undefined);
      setError(undefined);
    },
  };
}
