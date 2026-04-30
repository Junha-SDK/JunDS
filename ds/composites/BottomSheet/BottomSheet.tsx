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
export function BottomSheet({ open, onClose, title, children, height = "auto", className }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", handler); };
  }, [open, onClose]);

  return (
    <Portal>
      <div className={cn("fixed inset-0 z-50 transition-opacity duration-300", open ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col",
          heightMap[height],
          open ? "translate-y-0" : "translate-y-full",
          className,
        )} role="dialog" aria-modal="true" aria-label={title}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          {title && (
            <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <h3 className="text-base font-semibold">{title}</h3>
              <button type="button" onClick={onClose} className="p-1 text-muted hover:text-foreground cursor-pointer" aria-label="닫기">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </Portal>
  );
}
