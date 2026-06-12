"use client";
import { useState, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface ImageZoomProps {
  src: string;
  alt: string;
  /** 최대 확대 배율 */
  maxZoom?: number;
  /** 최소 확대 배율 */
  minZoom?: number;
  /** 종횡비 */
  aspectRatio?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 이미지 줌 — 더블클릭 확대, 드래그 이동, 스크롤 줌.
 * @example
 * <ImageZoom src="/full.jpg" alt="작품 전체" maxZoom={5} />
 * @status stable
 * @since 2.4.0
 * @tags photo, media
 */
export function ImageZoom({ src, alt, maxZoom = 4, minZoom = 1, aspectRatio = "16 / 9", className }: ImageZoomProps) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number } | null>(null);

  const clamp = useCallback((s: number) => Math.max(minZoom, Math.min(maxZoom, s)), [maxZoom, minZoom]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => clamp(s - e.deltaY * 0.005));
  };
  const onDoubleClick = () => setScale((s) => (s > 1 ? 1 : 2));
  const onPointerDown = (e: React.PointerEvent) => {
    if (scale === 1) return;
    dragging.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - dragging.current.x, y: e.clientY - dragging.current.y });
  };
  const onPointerUp = () => { dragging.current = null; };
  const reset = () => { setScale(1); setPos({ x: 0, y: 0 }); };

  return (
    <figure
      onWheel={onWheel}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className={cn("relative overflow-hidden rounded-xl bg-black cursor-zoom-in select-none m-0", scale > 1 && "cursor-grab", className)}
      style={{ aspectRatio }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain transition-transform duration-150"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur text-white text-xs px-2 py-1">
        <button type="button" onClick={() => setScale((s) => clamp(s - 0.5))} aria-label="축소" className="px-2 hover:opacity-80 cursor-pointer">−</button>
        <span className="tabular-nums w-10 text-center">{scale.toFixed(1)}x</span>
        <button type="button" onClick={() => setScale((s) => clamp(s + 0.5))} aria-label="확대" className="px-2 hover:opacity-80 cursor-pointer">+</button>
        <button type="button" onClick={reset} aria-label="원래 크기" className="px-2 hover:opacity-80 cursor-pointer">⟳</button>
      </div>
    </figure>
  );
}
