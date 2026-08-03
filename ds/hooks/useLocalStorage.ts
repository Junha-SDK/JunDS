"use client";
import { useState, useCallback } from "react";

/**
 * localStorage 동기화 상태 훅
 * @example
 * const [theme, setTheme] = useLocalStorage("theme", "light");
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        // quota exceeded
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
}
