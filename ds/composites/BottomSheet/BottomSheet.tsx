"use client";
import { useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";
import type { ReactNode } from "react";

export interface BottomSheetProps {
  /** 열림 상태 */
  open: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 상단 제목 */
  title?: string;
  /** 시트 본문 */
  children: ReactNode;
  /** 시트 높이 모드 */
  height?: "auto" | "half" | "full";
  /** 추가 클래스 */
  className?: string;
}

const heightMap = { auto: "max-h-[80vh]", half: "h-[50vh]", full: "h-[90vh]" };

/**
 * 화면 하단에서 슬라이드 업되는 시트형 모달.
 * @example
 * <BottomSheet open={open} onClose={() => setOpen(false)} title="옵션">
 *   <Menu />
 * </BottomSheet>
 * @status stable
 * @since 2.2.0
 * @tags overlay
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  height = "auto",
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  return (
    <Portal>
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 flex flex-col bg-card rounded-t-2xl",
            // 떠 있는 시트 — 위쪽으로 퍼지는 다층 그림자 + 얇은 링으로 배경에서 떼어낸다.
            "shadow-[0_-14px_40px_-14px_rgba(0,0,0,0.38),0_-4px_12px_-6px_rgba(0,0,0,0.2)] ring-1 ring-black/5",
            "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            heightMap[height],
            open ? "translate-y-0" : "translate-y-full",
            className,
          )}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted/40" />
          </div>
          {title && (
            <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-border shrink-0">
              <h3 className="min-w-0 truncate text-base font-semibold">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "shrink-0 p-1 rounded-lg cursor-pointer text-muted",
                  "transition-colors hover:text-foreground hover:bg-card-hover active:bg-muted/15",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                )}
                aria-label="닫기"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M4.5 4.5l9 9M13.5 4.5l-9 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </Portal>
  );
}
