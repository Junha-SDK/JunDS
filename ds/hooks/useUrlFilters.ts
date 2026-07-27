"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 필터 값으로 쓸 수 있는 타입 — URL 쿼리에 그대로 실을 수 있는 것만 */
export type FilterValue = string | number | boolean;

export interface UseUrlFiltersOptions<T> {
  /**
   * 값을 검증·정규화한다. URL 은 사용자가 손으로 고칠 수 있으므로,
   * 모르는 값이 상태로 새어 들어오지 않게 걸러 낼 때 쓴다.
   * `undefined` 를 반환하면 그 키는 기본값으로 되돌아간다.
   */
  parse?: Partial<{ [K in keyof T]: (raw: string) => T[K] | undefined }>;
  /**
   * URL 에 싣지 않을 키들. 로컬 전용 필터(작성 상태 등)가 배포 주소에 새는 것을 막는다.
   */
  transient?: ReadonlyArray<keyof T>;
  /**
   * 히스토리에 새 항목을 쌓을지 (기본 false = replace).
   *
   * 기본이 replace 인 이유: 필터를 몇 번 만지면 뒤로 가기가 그 횟수만큼 눌러야
   * 이전 페이지로 돌아가는 함정이 생긴다.
   */
  push?: boolean;
  /** 쿼리 파라미터 이름 앞에 붙일 접두사 (한 페이지에 필터 묶음이 둘 이상일 때) */
  prefix?: string;
}

export interface UseUrlFiltersReturn<T> {
  /** 현재 필터 값 */
  filters: T;
  /** 키 하나를 바꾼다 */
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  /** 여러 키를 한 번에 바꾼다 */
  patch: (partial: Partial<T>) => void;
  /** 전부 기본값으로 되돌린다 */
  reset: () => void;
  /** 기본값과 다른 필터가 하나라도 있는지 */
  isDirty: boolean;
  /** 기본값과 다른 필터의 개수 — "필터 3개 적용됨" 뱃지에 쓴다 */
  activeCount: number;
}

function toParamValue(v: FilterValue): string {
  return typeof v === "boolean" ? (v ? "1" : "0") : String(v);
}

function fromParamValue<V extends FilterValue>(raw: string, fallback: V): V {
  if (typeof fallback === "number") {
    const n = Number(raw);
    return (Number.isFinite(n) ? n : fallback) as V;
  }
  if (typeof fallback === "boolean") return (raw === "1" || raw === "true") as V;
  return raw as V;
}

/**
 * 필터 상태를 URL 쿼리 파라미터와 동기화하는 훅.
 *
 * 기본값과 같은 필터는 URL 에서 **생략한다.** 그래서 아무것도 안 건드린 목록의
 * 주소는 깨끗하게 남고, 공유된 링크에는 실제로 바꾼 조건만 담긴다.
 *
 * 라우터에 의존하지 않고 History API 만 쓰므로 Next.js·react-router·순수 SPA
 * 어디서나 같게 동작한다. 다만 라우터가 자체적으로 URL 을 관리하는 경우
 * (Next.js App Router 의 `useSearchParams` 등)와 함께 쓰면 서로 덮어쓸 수 있으니
 * 한 페이지에서는 한쪽만 쓴다.
 *
 * 뒤로/앞으로 가기(`popstate`)도 따라가므로, 필터를 바꾸다 뒤로 가면 이전 조건이
 * 그대로 복원된다.
 *
 * @param defaults - 필터 키와 기본값. 이 객체의 모양이 곧 스키마다.
 *
 * @example
 * ```tsx
 * const { filters, set, reset, activeCount } = useUrlFilters({
 *   category: "all",
 *   sort: "desc",
 *   q: "",
 * });
 *
 * <Select value={filters.category} onChange={(v) => set("category", v)} … />
 * {activeCount > 0 && <button onClick={reset}>필터 {activeCount}개 해제</button>}
 * ```
 */
export function useUrlFilters<T extends Record<string, FilterValue>>(
  defaults: T,
  options: UseUrlFiltersOptions<T> = {},
): UseUrlFiltersReturn<T> {
  const { parse, transient, push = false, prefix = "" } = options;

  // defaults 는 보통 인라인 객체 리터럴이라 매 렌더 새 참조다. 값으로만 쓰고
  // 의존성에는 넣지 않는다 — 넣으면 매 렌더 URL 을 다시 쓴다.
  const defaultsRef = useRef(defaults);
  const parseRef = useRef(parse);
  parseRef.current = parse;
  const transientRef = useRef(transient);
  transientRef.current = transient;

  const key = useCallback((k: string) => `${prefix}${k}`, [prefix]);

  const readFromUrl = useCallback((): T => {
    const base = defaultsRef.current;
    if (typeof window === "undefined") return { ...base };

    const sp = new URLSearchParams(window.location.search);
    const out = { ...base } as T;

    for (const k of Object.keys(base) as (keyof T)[]) {
      if (transientRef.current?.includes(k)) continue;
      const raw = sp.get(key(String(k)));
      if (raw == null) continue;

      const custom = parseRef.current?.[k];
      const parsed = custom
        ? custom(raw)
        : fromParamValue(raw, base[k] as FilterValue);
      // 검증에서 걸러진 값은 기본값 그대로 둔다
      if (parsed !== undefined) out[k] = parsed as T[keyof T];
    }
    return out;
  }, [key]);

  const [filters, setFilters] = useState<T>(readFromUrl);

  // 뒤로/앞으로 가기를 따라간다
  useEffect(() => {
    const onPop = () => setFilters(readFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [readFromUrl]);

  // 상태 → URL. 기본값과 같은 키는 싣지 않는다.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const base = defaultsRef.current;
    const sp = new URLSearchParams(window.location.search);

    for (const k of Object.keys(base) as (keyof T)[]) {
      const name = key(String(k));
      if (transientRef.current?.includes(k)) {
        sp.delete(name);
        continue;
      }
      const v = filters[k];
      if (v === base[k] || v === "" || v === undefined || v === null) sp.delete(name);
      else sp.set(name, toParamValue(v as FilterValue));
    }

    const qs = sp.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next === currentUrl) return; // 같은 주소를 다시 쓰면 히스토리만 더럽힌다

    window.history[push ? "pushState" : "replaceState"](window.history.state, "", next);
  }, [filters, key, push]);

  const set = useCallback(<K extends keyof T>(k: K, value: T[K]) => {
    setFilters((prev) => (prev[k] === value ? prev : { ...prev, [k]: value }));
  }, []);

  const patch = useCallback((partial: Partial<T>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => setFilters({ ...defaultsRef.current }), []);

  const changed = (Object.keys(defaultsRef.current) as (keyof T)[]).filter(
    (k) => filters[k] !== defaultsRef.current[k],
  );

  return {
    filters,
    set,
    patch,
    reset,
    isDirty: changed.length > 0,
    activeCount: changed.length,
  };
}
