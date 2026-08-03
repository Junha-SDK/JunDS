"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface ResizableProps {
  /** 두 개의 패널 (튜플) */
  children: [ReactNode, ReactNode];
  /** 분할 방향 */
  direction?: "horizontal" | "vertical";
  /** 첫 번째 패널의 기본 크기 (퍼센트) */
  defaultSize?: number;
  /** 최소 크기 (퍼센트) */
  minSize?: number;
  /** 최대 크기 (퍼센트) */
  maxSize?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 리사이저블
 * 드래그 핸들로 크기를 조절할 수 있는 분할 패널
 * @example
 * <Resizable direction="horizontal" defaultSize={30}>
 *   <div>왼쪽</div>
 *   <div>오른쪽</div>
 * </Resizable>
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function Resizable({
  children,
  direction = "horizontal",
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  className,
}: ResizableProps) {
  const [size, setSize] = useState(defaultSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const isHorizontal = direction === "horizontal";

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      document.body.style.cursor = isHorizontal ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    },
    [isHorizontal],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let pct: number;
      if (isHorizontal) {
        pct = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        pct = ((e.clientY - rect.top) / rect.height) * 100;
      }
      pct = Math.max(minSize, Math.min(maxSize, pct));
      setSize(pct);
    };

    const handleMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isHorizontal, minSize, maxSize]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex overflow-hidden border border-border rounded-xl",
        isHorizontal ? "flex-row" : "flex-col",
        className,
      )}
    >
      {/* 첫 번째 패널 */}
      <div
        className="overflow-auto"
        style={isHorizontal ? { width: `${size}%` } : { height: `${size}%` }}
      >
        {children[0]}
      </div>

      {/* 드래그 핸들 — 마우스로만 잡을 수 있으면 키보드 사용자에게는 고정 레이아웃이다.
          separator 로 알리고 화살표로도 옮길 수 있게 한다 */}
      <div
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation={isHorizontal ? "vertical" : "horizontal"}
        aria-label="패널 크기 조절"
        aria-valuenow={Math.round(size)}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 값을 가진 separator 는 ARIA window splitter 이고, 그 패턴은 포커스를 받아 화살표로 움직이는 것이 정의다
        tabIndex={0}
        onKeyDown={(e) => {
          const dec = isHorizontal ? "ArrowLeft" : "ArrowUp";
          const inc = isHorizontal ? "ArrowRight" : "ArrowDown";
          if (e.key !== dec && e.key !== inc) return;
          e.preventDefault();
          const step = e.shiftKey ? 10 : 2;
          setSize((s) => Math.max(minSize, Math.min(maxSize, s + (e.key === inc ? step : -step))));
        }}
        className={cn(
          "relative shrink-0 bg-border transition-colors duration-150 hover:bg-primary/30 active:bg-primary/50",
          "focus-visible:outline-none focus-visible:bg-primary/40 focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
          isHorizontal ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize",
        )}
      >
        {/* 핸들 표시 */}
        <div
          className={cn(
            "absolute bg-muted rounded-full pointer-events-none",
            isHorizontal
              ? "w-1 h-6 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              : "h-1 w-6 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          )}
        />
      </div>

      {/* 두 번째 패널 */}
      <div className="flex-1 overflow-auto">{children[1]}</div>
    </div>
  );
}
