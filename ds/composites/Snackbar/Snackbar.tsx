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
  {
    open,
    message,
    variant = "default",
    position = "bottom",
    duration = 4000,
    actionLabel,
    onAction,
    onClose,
    className,
    ...props
  },
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
      onTransitionEnd={() => {
        if (!open) setMounted(false);
      }}
      className={cn(
        "fixed z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm",
        "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-white/10",
        // 변하는 것은 투명도와 변환뿐 — transition-all 은 패딩·폭까지 물어 매 프레임 리플로우를 만든다.
        // 감속 요청에도 전이를 끄지 않는다: 닫힘 해제(`onTransitionEnd`)가 이 전이에 매달려 있어
        // transition-none 이면 보이지 않는 스낵바가 DOM 에 그대로 남아 클릭을 가로챈다.
        "min-w-[220px] max-w-[420px] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)]",
        positionClass[position],
        variantClass[variant],
        // 사라지는 동안에도 투명한 판이 클릭을 먹지 않게 한다
        open
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-95 pointer-events-none",
        className,
      )}
      {...props}
    >
      <span className="flex-1">{message}</span>
      {actionLabel && (
        <button
          type="button"
          onClick={() => {
            onAction?.();
            onClose?.();
          }}
          // 스낵바는 변형마다 배경이 달라진다 — 링을 currentColor 로 잡아야 어떤 변형에서도 보인다
          className="text-xs font-semibold uppercase tracking-wider rounded-lg px-1.5 py-1 -my-1 hover:bg-white/15 active:bg-white/25 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-inset"
        >
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="ml-1 p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-inset"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path
            d="M3.5 3.5l7 7M10.5 3.5l-7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
});
