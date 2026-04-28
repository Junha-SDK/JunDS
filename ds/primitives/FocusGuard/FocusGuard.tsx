"use client";
import { useRef, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface FocusGuardProps {
  children: ReactNode;
  active?: boolean;
  autoFocus?: boolean;
  returnFocus?: boolean;
  className?: string;
}

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
