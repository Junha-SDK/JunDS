"use client";
import { useRef, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface FocusGuardProps {
  /** 포커스를 가둘 자식 트리 */
  children: ReactNode;
  /** 포커스 트랩 활성화 여부 */
  active?: boolean;
  /** 마운트 시 첫 요소에 자동 포커스 */
  autoFocus?: boolean;
  /** 언마운트 시 이전 포커스 복원 */
  returnFocus?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 지정 영역 내부에 포커스를 가두는(trap) 래퍼. 모달·드로어 등에 사용합니다.
 * @example
 * <FocusGuard active={open} returnFocus>
 *   <DialogContent />
 * </FocusGuard>
 * @status stable
 * @since 2.2.0
 * @tags accessibility
 */
export function FocusGuard({
  children,
  active = true,
  autoFocus = true,
  returnFocus = true,
  className,
}: FocusGuardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previousFocus.current = document.activeElement as HTMLElement;
    if (autoFocus && ref.current) {
      const first = ref.current.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    }
    return () => {
      if (returnFocus) previousFocus.current?.focus();
    };
  }, [active, autoFocus, returnFocus]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!active || e.key !== "Tab" || !ref.current) return;
    const focusable = ref.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }, [active]);

  return (
    <div ref={ref} onKeyDown={handleKeyDown} className={cn(className)}>
      {children}
    </div>
  );
}
