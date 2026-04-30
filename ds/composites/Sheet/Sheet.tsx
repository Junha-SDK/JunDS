"use client";
import { useEffect, useCallback, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { Portal } from "../../primitives/Portal";
import type { ReactNode } from "react";

export interface SheetProps {
  /** 열림 상태 */
  open: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 시트 본문 */
  children: ReactNode;
  /** 헤더 제목 */
  title?: string;
  /** 스냅 포인트(vh 단위 배열) */
  snapPoints?: number[];
  /** 추가 클래스 */
  className?: string;
}

const DRAG_DISMISS_THRESHOLD = 150;

/**
 * 모바일 바텀 시트 (드래그로 닫기 지원)
 * @example
 * <Sheet open={isOpen} onClose={close} title="옵션">
 *   <p>시트 내용</p>
 * </Sheet>
 * @status stable
 * @since 2.2.0
 * @tags overlay
 */
export function Sheet({
  open,
  onClose,
  children,
  title,
  snapPoints,
  className,
}: SheetProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
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

  /* 드래그가 끝나면 닫기 여부 결정 */
  useEffect(() => {
    if (!open) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [open]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (dragY > DRAG_DISMISS_THRESHOLD) {
      onClose();
    }
    setDragY(0);
  }, [dragY, onClose]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    setIsDragging(true);

    const handleMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientY - dragStartY.current;
      if (delta > 0) setDragY(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragY((current) => {
        if (current > DRAG_DISMISS_THRESHOLD) onClose();
        return 0;
      });
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [onClose]);

  /* snapPoints 로 최대 높이 결정 */
  const maxSnap = snapPoints?.length ? Math.max(...snapPoints) : 70;
  const sheetHeight = `${maxSnap}vh`;

  return (
    <Portal>
      {/* 배경 */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      {/* 시트 */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col",
          "transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]",
          !isDragging && "duration-300",
          open ? "translate-y-0" : "translate-y-full",
          className,
        )}
        style={{
          maxHeight: sheetHeight,
          transform: open ? `translateY(${dragY}px)` : undefined,
        }}
      >
        {/* 드래그 핸들 */}
        <div
          className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-border-light shrink-0">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </Portal>
  );
}
