"use client";
import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapOptions {
  /** 활성화 여부 */
  enabled?: boolean;
  /** 마운트 시 첫 요소로 포커스 */
  autoFocus?: boolean;
  /** 언마운트 시 이전 포커스 복원 */
  restoreFocus?: boolean;
}

/**
 * Tab/Shift+Tab을 컨테이너 내부에 가두는 포커스 트랩.
 * Modal/Drawer/Dialog 내부에서 사용.
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useFocusTrap(ref, { enabled: open });
 * return <div ref={ref}>...</div>;
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { enabled = true, autoFocus = true, restoreFocus = true }: UseFocusTrapOptions = {},
) {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = ref.current;
    if (!root) return;

    previousFocus.current = (
      typeof document !== "undefined" ? document.activeElement : null
    ) as HTMLElement | null;

    if (autoFocus) {
      const focusable = root.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusable[0] ?? root).focus({ preventScroll: true });
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    root.addEventListener("keydown", handleKey);
    return () => {
      root.removeEventListener("keydown", handleKey);
      if (
        restoreFocus &&
        previousFocus.current &&
        typeof previousFocus.current.focus === "function"
      ) {
        previousFocus.current.focus({ preventScroll: true });
      }
    };
  }, [enabled, autoFocus, restoreFocus, ref]);
}
