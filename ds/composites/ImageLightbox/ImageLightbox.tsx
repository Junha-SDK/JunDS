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
  /** 이미지 URL */
  src: string;
  /** 대체 텍스트 */
  alt?: string;
  /** 썸네일 클릭 시 확대 */
  children?: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
}

// 어두운 오버레이 위의 컨트롤 3종이 같은 형태를 공유한다
const lightboxCtrl = cn(
  "w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer",
  "ring-1 ring-white/15 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)]",
  "transition-colors hover:bg-white/20 active:bg-white/30",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/60",
);

/**
 * 이미지를 클릭해 확대 보기를 띄우는 라이트박스.
 * @example
 * <ImageLightbox src="/photo.jpg" alt="사진" />
 * @status stable
 * @since 2.2.0
 * @tags media, overlay
 */
export function ImageLightbox({ src, alt = "", children, className }: ImageLightboxProps) {
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
      role="dialog"
      aria-modal="true"
      aria-label={alt || "이미지 확대 보기"}
    >
      {/* 배경 — animate-in/fade-in 은 이 저장소에 없는 유틸이라 아무 일도 하지 않았다 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in motion-reduce:animate-none" />

      {/* 줌 컨트롤 — 어두운 크롬 위이므로 링도 흰색이어야 보인다 */}
      <div className="absolute top-4 right-4 z-10 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={zoomOut}
          className={cn(lightboxCtrl, "text-lg")}
          aria-label="축소"
        >
          &minus;
        </button>
        <button
          type="button"
          onClick={zoomIn}
          className={cn(lightboxCtrl, "text-lg")}
          aria-label="확대"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleClose}
          className={cn(lightboxCtrl, "text-2xl")}
          aria-label="닫기"
        >
          &times;
        </button>
      </div>

      {/* 이미지 — scale 은 움직임이라 감속 요청을 받는다 */}
      <img
        src={src}
        alt={alt}
        className="relative z-[1] max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-200 ease-out motion-reduce:transition-none"
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
        className={cn(
          "cursor-zoom-in inline-block max-w-full rounded-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        aria-label={alt || "이미지 확대"}
      >
        {children ?? (
          <img
            src={src}
            alt={alt}
            className="block max-w-full h-auto rounded-xl ring-1 ring-border-light"
            loading="lazy"
          />
        )}
      </button>
      {mounted && overlay && createPortal(overlay, document.body)}
    </>
  );
}
