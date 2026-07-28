"use client";
import { useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";

export interface AlertDialogProps {
  /** 열림 상태 */
  open: boolean;
  /** 확인 콜백 */
  onConfirm: () => void;
  /** 취소 콜백 */
  onCancel: () => void;
  /** 다이얼로그 제목 */
  title: string;
  /** 다이얼로그 본문 설명 */
  description: string;
  /** 확인 버튼 라벨 */
  confirmLabel?: string;
  /** 취소 버튼 라벨 */
  cancelLabel?: string;
  /** 알림 유형 */
  variant?: "danger" | "warning" | "info";
  /** 로딩 상태 */
  loading?: boolean;
  /** 추가 클래스 */
  className?: string;
}

const variantIcon: Record<string, { bg: string; stroke: string; path: string }> = {
  danger: {
    bg: "bg-danger-light",
    stroke: "var(--danger)",
    path: "M10 2L1.5 17.5h17L10 2z",
  },
  warning: {
    // 리터럴 #d97706 / bg-yellow-50 은 다크에서 그대로 밝게 남는다 — 경고 토큰으로 옮긴다.
    bg: "bg-warning-light",
    stroke: "var(--warning)",
    path: "M10 2L1.5 17.5h17L10 2z",
  },
  info: {
    bg: "bg-primary-light",
    stroke: "var(--primary)",
    path: "M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z",
  },
};

/**
 * 경고 다이얼로그 (배경 클릭으로 닫기 불가)
 * @example
 * <AlertDialog
 *   open={show}
 *   onConfirm={handleConfirm}
 *   onCancel={() => setShow(false)}
 *   title="삭제하시겠습니까?"
 *   description="이 작업은 되돌릴 수 없습니다."
 *   variant="danger"
 * />
 * @status stable
 * @since 2.2.0
 * @tags overlay, feedback
 */
export function AlertDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "info",
  loading = false,
  className,
}: AlertDialogProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  if (!open) return null;

  const icon = variantIcon[variant];

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-modal="true"
        role="alertdialog"
      >
        {/* 배경 (클릭해도 닫히지 않음) */}
        <div className="absolute inset-0 bg-black/40 animate-fade-in motion-reduce:animate-none" />
        {/* 컨텐츠 */}
        <div
          className={cn(
            "relative w-full max-w-md bg-card rounded-2xl overflow-hidden",
            // 떠 있는 면은 한 겹 그림자로는 서지 않는다 — 다층 그림자 + 얇은 링으로 세운다.
            "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45),0_8px_20px_-8px_rgba(0,0,0,0.25)] ring-1 ring-border",
            "animate-fade-in-scale motion-reduce:animate-none",
            className,
          )}
        >
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  icon.bg,
                )}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d={icon.path}
                    stroke={icon.stroke}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 8v4M10 14.5h.01"
                    stroke={icon.stroke}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted">{description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-light">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xl cursor-pointer",
                "transition-[background-color,border-color,transform] duration-150",
                // 라이트 전용 gray-100/200 대신 모드를 따라가는 카드·경계 토큰.
                "text-foreground bg-card-hover border border-border hover:bg-border-light active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
                "motion-reduce:transition-none motion-reduce:active:scale-100",
              )}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xl cursor-pointer text-white",
                "transition-[background-color,box-shadow,transform] duration-150",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
                "motion-reduce:transition-none motion-reduce:active:scale-100",
                variant === "danger" && "bg-danger hover:bg-danger-hover",
                // amber-600 은 경고 토큰을 우회한 리터럴 팔레트였다.
                variant === "warning" && "bg-warning hover:brightness-95",
                variant === "info" && "bg-primary hover:bg-primary-hover",
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-75"
                    />
                  </svg>
                  {confirmLabel}
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
