"use client";
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

type SetValue<T> = Dispatch<SetStateAction<T>>;

/**
 * sessionStorage 동기화 훅 (탭 단위 영속).
 * useLocalStorage와 동일 시그니처, 저장소만 다름.
 * @example
 * const [tab, setTab] = useSessionStorage("active-tab", "home");
 */
export function useSessionStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const read = useCallback((): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValueState] = useState<T>(read);

  const setValue: SetValue<T> = useCallback(
    (next) => {
      setValueState((prev) => {
        const resolved = typeof next === "function" ? (next as (v: T) => T)(prev) : next;
        try {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(key, JSON.stringify(resolved));
          }
        } catch {}
        return resolved;
      });
    },
    [key],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === window.sessionStorage) {
        setValueState(read());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, read]);

  return [value, setValue];
}
