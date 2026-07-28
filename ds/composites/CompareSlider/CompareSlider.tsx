"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface CompareSliderProps {
  /** Before 이미지 URL */
  before: string;
  /** After 이미지 URL */
  after: string;
  /** Before 라벨 */
  beforeLabel?: string;
  /** After 라벨 */
  afterLabel?: string;
  /** 초기 슬라이더 위치(%) */
  initialPosition?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 두 이미지를 좌/우로 비교하는 슬라이더.
 * @example
 * <CompareSlider before="/before.jpg" after="/after.jpg" beforeLabel="이전" afterLabel="이후" />
 * @status stable
 * @since 2.2.0
 * @tags media
 */
export function CompareSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  initialPosition = 50,
  className,
}: CompareSliderProps) {
  const [position, setPosition] = useState(initialPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => {
    dragging.current = true;
  };
  const handleMouseUp = () => {
    dragging.current = false;
  };
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging.current) updatePosition(e.clientX);
    },
    [updatePosition],
  );
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative select-none overflow-hidden rounded-xl cursor-ew-resize",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      // role="slider" + tabIndex 로 포커스는 받아 놓고 방향키는 받지 않았다.
      // 포커스 링이 의미를 가지려면 키보드로도 실제로 움직여야 한다.
      onKeyDown={(e) => {
        const step = e.shiftKey ? 10 : 2;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setPosition((p) => Math.max(0, p - step));
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setPosition((p) => Math.min(100, p + step));
        } else if (e.key === "Home") {
          e.preventDefault();
          setPosition(0);
        } else if (e.key === "End") {
          e.preventDefault();
          setPosition(100);
        }
      }}
      role="slider"
      tabIndex={0}
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="이미지 비교"
    >
      {/* After (full) */}
      <img src={after} alt={afterLabel} className="block w-full h-auto" draggable={false} />

      {/* Before (clipped) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={before} alt={beforeLabel} className="block w-full h-auto" draggable={false} />
      </div>

      {/* Labels */}
      {/* 사진 위에 얹히는 크롬이라 검정 스크림·흰 글자가 두 모드 모두에서 맞다. */}
      <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-medium bg-black/50 text-white rounded-lg backdrop-blur-sm ring-1 ring-white/15 whitespace-nowrap">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium bg-black/50 text-white rounded-lg backdrop-blur-sm ring-1 ring-white/15 whitespace-nowrap">
        {afterLabel}
      </span>

      {/* Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.35)] cursor-ew-resize"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* 손잡이는 흰색 고정이다 — 아이콘이 currentColor 라 foreground 를 상속하면
            다크에서 흰 원 위에 흰 화살표가 되어 사라진다. 전경색을 명시한다. */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-black/70 rounded-full flex items-center justify-center ring-1 ring-black/10 shadow-[0_6px_16px_-4px_rgba(0,0,0,0.4),0_2px_4px_-2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M4.5 5L2.5 7L4.5 9M9.5 5L11.5 7L9.5 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
