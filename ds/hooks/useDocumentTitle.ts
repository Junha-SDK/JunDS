"use client";
import { useEffect, useRef } from "react";

export interface UseDocumentTitleOptions {
  /** 언마운트 시 이전 title 복원 */
  restoreOnUnmount?: boolean;
}

/**
 * document.title 동기화.
 * @example
 * useDocumentTitle("대시보드 - JunDS");
 */
export function useDocumentTitle(title: string, { restoreOnUnmount = false }: UseDocumentTitleOptions = {}) {
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (previous.current === null) previous.current = document.title;
    document.title = title;
  }, [title]);

  useEffect(() => {
    return () => {
      if (restoreOnUnmount && previous.current !== null && typeof document !== "undefined") {
        document.title = previous.current;
      }
    };
  }, [restoreOnUnmount]);
}
