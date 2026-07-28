"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface ImageCropperProps {
  /** 이미지 소스 URL */
  src: string;
  /** 크롭 영역 종횡비 */
  aspectRatio?: number;
  /** 크롭 결과 콜백 */
  onCrop?: (dataUrl: string) => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 이미지를 잘라내는 크로퍼.
 * @example
 * <ImageCropper src={imageUrl} aspectRatio={1} onCrop={setCropped} />
 * @status stable
 * @since 2.2.0
 * @tags media
 */
export function ImageCropper({ src, aspectRatio = 1, onCrop, className }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 25, y: 25, size: 50 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, cropX: crop.x, cropY: crop.y };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
      const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
      setCrop((c) => ({
        ...c,
        x: Math.max(0, Math.min(100 - c.size, dragStart.current.cropX + dx)),
        y: Math.max(0, Math.min(100 - c.size / aspectRatio, dragStart.current.cropY + dy)),
      }));
    },
    [aspectRatio],
  );

  const handleMouseUp = () => {
    dragging.current = false;
  };

  const handleCrop = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const sx = (crop.x / 100) * img.width;
      const sy = (crop.y / 100) * img.height;
      const sw = (crop.size / 100) * img.width;
      const sh = sw / aspectRatio;
      canvas.width = sw;
      canvas.height = sh;
      canvas.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      onCrop?.(canvas.toDataURL("image/png"));
    };
    img.src = src;
  };

  return (
    <div className={cn("inline-block", className)}>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img src={src} alt="" className="block w-full" draggable={false} />
        {/* Dimmed overlay */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Crop area */}
        <div
          className="absolute border-2 border-white cursor-move"
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.size}%`,
            height: `${crop.size / aspectRatio}%`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${100 / (crop.size / 100)}% auto`,
            backgroundPosition: `${-crop.x / (crop.size / 100)}% ${
              -crop.y / (crop.size / (100 * aspectRatio))
            }%`,
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Corner handles */}
          {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos) => (
            <div
              key={pos}
              // 손잡이는 사진 위에 얹히는 크롬이라 흰 면을 유지한다. 다만 테두리는
              // Tailwind 회색 팔레트(gray-400) 대신 어느 사진 위에서도 읽히는 검정 알파로.
              className={`absolute ${pos} w-3 h-3 bg-white border border-black/30 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.35)] -translate-x-1/2 -translate-y-1/2`}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCrop}
        className={cn(
          "mt-2 px-4 py-2 text-sm bg-primary text-white rounded-xl cursor-pointer",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-primary-hover",
          "transition-[background-color,transform] duration-150 active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "motion-reduce:transition-none motion-reduce:active:scale-100",
        )}
      >
        자르기
      </button>
    </div>
  );
}
