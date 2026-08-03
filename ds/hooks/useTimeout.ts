"use client";
import { useEffect, useRef, useCallback } from "react";

/**
 * setTimeout의 React-friendly 버전. callback이 stale 되지 않음.
 * delay=null 이면 일시정지.
 * @example
 * useTimeout(() => alert("hi"), 1000);
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const cbRef = useRef(callback);
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (idRef.current !== null) {
      window.clearTimeout(idRef.current);
      idRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    if (delay !== null) {
      idRef.current = window.setTimeout(() => cbRef.current(), delay);
    }
  }, [delay, clear]);

  useEffect(() => {
    reset();
    return clear;
  }, [reset, clear]);

  return { clear, reset };
}
