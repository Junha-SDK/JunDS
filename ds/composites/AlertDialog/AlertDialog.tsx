"use client";
import { useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";

export interface AlertDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  className?: string;
}

const variantIcon: Record<string, { bg: string; stroke: string; path: string }> = {
  danger: {
    bg: "bg-danger-light",
    stroke: "var(--danger)",
    path: "M10 2L1.5 17.5h17L10 2z",
  },
  warning: {
    bg: "bg-yellow-50",
    stroke: "#d97706",
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
        <div className="absolute inset-0 bg-black/40 animate-fade-in" />
        {/* 컨텐츠 */}
        <div
          className={cn(
            "relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-in-scale overflow-hidden",
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
                  <path d={icon.path} stroke={icon.stroke} strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M10 8v4M10 14.5h.01" stroke={icon.stroke} strokeWidth="1.5" strokeLinecap="round" />
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
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                "text-foreground bg-gray-100 hover:bg-gray-200 disabled:opacity-40",
              )}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer text-white",
                "disabled:opacity-40",
                variant === "danger" && "bg-danger hover:bg-danger/90",
                variant === "warning" && "bg-amber-600 hover:bg-amber-700",
                variant === "info" && "bg-primary hover:bg-primary/90",
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
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
