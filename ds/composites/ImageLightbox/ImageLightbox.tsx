"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils";

/**
 * 이미지 라이트박스 컴포넌트
 *
 * - 썸네일 클릭 시 전체 화면 오버레이로 확대
 * - 어두운 배경 + 줌 컨트롤
 * - 배경 클릭, Escape, X 버튼으로 닫기
 * - 부드러운 scale-in 애니메이션
 * - Portal 사용
 */
export interface ImageLightboxProps {
  src: string;
  alt?: string;
  /** 썸네일 클릭 시 확대 */
  children?: React.ReactNode;
  className?: string;
}

export function ImageLightbox({
  src,
  alt = "",
  children,
  className,
}: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = useCallback(() => {
    setScale(1);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.5, 3)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.5, 0.5)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, handleClose]);

  const overlay = open ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* 줌 컨트롤 */}
      <div
        className="absolute top-4 right-4 z-10 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={zoomOut}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg flex items-center justify-center transition-colors"
          aria-label="축소"
        >
          &minus;
        </button>
        <button
          onClick={zoomIn}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg flex items-center justify-center transition-colors"
          aria-label="확대"
        >
          +
        </button>
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
          aria-label="닫기"
        >
          &times;
        </button>
      </div>

      {/* 이미지 */}
      <img
        src={src}
        alt={alt}
        className="relative z-[1] max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-200 ease-out"
        style={{ transform: `scale(${scale})` }}
        onClick={(e) => e.stopPropagation()}
        loading="lazy"
      />
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={cn("cursor-zoom-in inline-block", className)}
        aria-label={alt || "이미지 확대"}
      >
        {children ?? (
          <img
            src={src}
            alt={alt}
            className="rounded-md"
            loading="lazy"
          />
        )}
      </button>
      {mounted && overlay && createPortal(overlay, document.body)}
    </>
  );
}
