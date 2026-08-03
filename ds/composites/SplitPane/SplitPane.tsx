"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface SplitPaneProps {
  /** 왼쪽(또는 위쪽) 패널 */
  left: ReactNode;
  /** 오른쪽(또는 아래쪽) 패널 */
  right: ReactNode;
  /** 분할 방향 */
  direction?: "horizontal" | "vertical";
  /** 기본 크기(%) */
  defaultSize?: number;
  /** 최소 크기(%) */
  minSize?: number;
  /** 최대 크기(%) */
  maxSize?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 좌/우(또는 상/하)로 크기 조절 가능한 분할 패널.
 * @example
 * <SplitPane left={<FileTree />} right={<Editor />} direction="horizontal" defaultSize={240} />
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function SplitPane({
  left,
  right,
  direction = "horizontal",
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  className,
}: SplitPaneProps) {
  const [size, setSize] = useState(defaultSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const isHoriz = direction === "horizontal";

  const handleMouseDown = () => {
    dragging.current = true;
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = isHoriz
        ? ((e.clientX - rect.left) / rect.width) * 100
        : ((e.clientY - rect.top) / rect.height) * 100;
      setSize(Math.max(minSize, Math.min(maxSize, pos)));
    },
    [isHoriz, minSize, maxSize],
  );

  const handleMouseUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={cn("flex overflow-hidden", isHoriz ? "flex-row" : "flex-col", className)}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ height: "100%" }}
    >
      <div
        className="overflow-auto"
        style={isHoriz ? { width: `${size}%` } : { height: `${size}%` }}
      >
        {left}
      </div>
      <div
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation={isHoriz ? "vertical" : "horizontal"}
        className={cn(
          "relative shrink-0 select-none touch-none bg-border hover:bg-primary/30 active:bg-primary/50 transition-colors",
          // 1px 짜리 손잡이는 사실상 못 잡는다. 레이아웃은 그대로 두고 히트 영역만
          // 의사요소로 양옆 4px 씩 넓힌다.
          isHoriz
            ? "w-1 cursor-col-resize after:absolute after:inset-y-0 after:-inset-x-1 after:content-['']"
            : "h-1 cursor-row-resize after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
        )}
      />
      <div className="flex-1 overflow-auto">{right}</div>
    </div>
  );
}
