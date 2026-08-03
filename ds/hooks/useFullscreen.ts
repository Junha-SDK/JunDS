"use client";
import { useCallback, useEffect, useState, type RefObject } from "react";

export interface UseFullscreenReturn {
  /** 현재 풀스크린 여부 */
  isFullscreen: boolean;
  /** 풀스크린 진입 */
  enter: () => Promise<void>;
  /** 풀스크린 해제 */
  exit: () => Promise<void>;
  /** 토글 */
  toggle: () => Promise<void>;
  /** 브라우저 지원 여부 */
  supported: boolean;
}

/**
 * Fullscreen API 래퍼 (특정 element 또는 document 단위).
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const fs = useFullscreen(ref);
 * <button onClick={fs.toggle}>{fs.isFullscreen ? "종료" : "전체화면"}</button>
 */
export function useFullscreen<T extends HTMLElement>(
  ref?: RefObject<T | null>,
): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const supported = typeof document !== "undefined" && (document.fullscreenEnabled ?? false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const enter = useCallback(async () => {
    const el = ref?.current ?? (typeof document !== "undefined" ? document.documentElement : null);
    if (!el || !el.requestFullscreen) return;
    await el.requestFullscreen();
  }, [ref]);

  const exit = useCallback(async () => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }, []);

  const toggle = useCallback(async () => {
    if (typeof document !== "undefined" && document.fullscreenElement) await exit();
    else await enter();
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle, supported };
}
