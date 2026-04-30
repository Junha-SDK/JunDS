"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type SnackbarVariant = "default" | "success" | "error" | "warning" | "info";
export type SnackbarPosition = "bottom" | "top" | "bottom-left" | "bottom-right";

export interface SnackbarProps extends HTMLAttributes<HTMLDivElement> {
  /** 표시 여부 */
  open: boolean;
  /** 메시지 */
  message: ReactNode;
  /** 변형 */
  variant?: SnackbarVariant;
  /** 위치 */
  position?: SnackbarPosition;
  /** 자동 닫힘(ms), 0 이면 수동 */
  duration?: number;
  /** 우측 액션 라벨 (예: "실행 취소") */
  actionLabel?: string;
  /** 액션 클릭 콜백 */
  onAction?: () => void;
  /** 닫힘 콜백 */
  onClose?: () => void;
}

const variantClass: Record<SnackbarVariant, string> = {
  default: "bg-foreground text-background",
  success: "bg-success text-white",
  error: "bg-danger text-white",
  warning: "bg-warning text-white",
  info: "bg-info text-white",
};

const positionClass: Record<SnackbarPosition, string> = {
  bottom: "bottom-4 left-1/2 -translate-x-1/2",
  top: "top-4 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

/**
 * 짧은 알림(스낵바) — Toast보다 가볍고 단일/액션 중심.
 * @example
 * <Snackbar open={open} message="저장됨" actionLabel="실행 취소" onAction={undo} onClose={() => setOpen(false)} />
 * @status stable
 * @since 2.3.0
 * @tags feedback
 */
export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(function Snackbar(
  { open, message, variant = "default", position = "bottom", duration = 4000, actionLabel, onAction, onClose, className, ...props },
  ref,
) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!open || !duration) return;
    const id = window.setTimeout(() => onClose?.(), duration);
    return () => window.clearTimeout(id);
  }, [open, duration, onClose]);

  if (!open && !mounted) return null;

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      onTransitionEnd={() => { if (!open) setMounted(false); }}
      className={cn(
        "fixed z-50 flex items-center gap-3 rounded-lg shadow-lg px-4 py-3 text-sm",
        "min-w-[220px] max-w-[420px] transition-all duration-200",
        positionClass[position],
        variantClass[variant],
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className,
      )}
      {...props}
    >
      <span className="flex-1">{message}</span>
      {actionLabel && (
        <button
          type="button"
          onClick={() => { onAction?.(); onClose?.(); }}
          className="text-xs font-semibold uppercase tracking-wider hover:opacity-80 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="ml-1 p-1 rounded hover:bg-white/20 transition-colors cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
});
