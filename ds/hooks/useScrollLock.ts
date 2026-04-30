"use client";
import { useEffect } from "react";

let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

/**
 * body 스크롤을 잠금. Modal/Drawer/Lightbox 등에서 사용.
 * 여러 잠금을 카운트로 관리하므로 nested 사용 안전.
 * @example
 * useScrollLock(open);
 */
export function useScrollLock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    if (lockCount === 0) {
      const body = document.body;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      originalOverflow = body.style.overflow;
      originalPaddingRight = body.style.paddingRight;
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    lockCount++;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }
    };
  }, [enabled]);
}
