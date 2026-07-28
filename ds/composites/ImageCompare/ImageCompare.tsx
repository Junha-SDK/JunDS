"use client";
import { useState, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface ImageCompareProps {
  /** 이전 이미지 */
  beforeSrc: string;
  /** 이후 이미지 */
  afterSrc: string;
  /** 이전 alt */
  beforeAlt: string;
  /** 이후 alt */
  afterAlt: string;
  /** 초기 분할 비율 (0-100) */
  initialSplit?: number;
  /** 종횡비 */
  aspectRatio?: string;
  /** 라벨 표시 */
  showLabels?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 이미지 비교 — 슬라이더로 before/after 분할 비교.
 * @example
 * <ImageCompare beforeSrc="/old.jpg" afterSrc="/new.jpg" beforeAlt="원본" afterAlt="보정" />
 * @status stable
 * @since 2.4.0
 * @tags photo, media
 */
export function ImageCompare({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  initialSplit = 50,
  aspectRatio = "16 / 9",
  showLabels = true,
  className,
}: ImageCompareProps) {
  const [split, setSplit] = useState(Math.max(0, Math.min(100, initialSplit)));
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.max(0, Math.min(100, ratio)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setSplit((s) => Math.max(0, s - 2));
    else if (e.key === "ArrowRight") setSplit((s) => Math.min(100, s + 2));
    else if (e.key === "Home") setSplit(0);
    else if (e.key === "End") setSplit(100);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className={cn("relative overflow-hidden rounded-xl bg-black select-none", className)}
      style={{ aspectRatio }}
    >
      <img
        src={beforeSrc}
        alt={beforeAlt}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      >
        <img src={afterSrc} alt={afterAlt} className="w-full h-full object-cover" />
      </div>

      {showLabels && (
        <>
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold backdrop-blur">
            After
          </span>
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-semibold backdrop-blur">
            Before
          </span>
        </>
      )}

      <div
        role="slider"
        aria-label="비교 분할 위치"
        aria-valuenow={Math.round(split)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="absolute inset-y-0 cursor-ew-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{ left: `${split}%`, transform: "translateX(-50%)", width: 32 }}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-black text-xs">
          ⇆
        </div>
      </div>
    </div>
  );
}
