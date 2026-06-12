"use client";
import { useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";

export interface LightboxPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export interface PhotoLightboxProps {
  /** 표시 사진 목록 */
  photos: LightboxPhoto[];
  /** 현재 인덱스 (controlled) */
  index: number;
  /** 인덱스 변경 콜백 */
  onIndexChange: (index: number) => void;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 열림 상태 */
  open: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 사진 라이트박스 — 키보드 화살표/Esc 지원하는 풀스크린 뷰어.
 * @example
 * <PhotoLightbox open={open} photos={photos} index={i} onIndexChange={setI} onClose={()=>setOpen(false)} />
 * @status stable
 * @since 2.4.0
 * @tags photo, overlay
 */
export function PhotoLightbox({ photos, index, onIndexChange, onClose, open, className }: PhotoLightboxProps) {
  const t = useT();
  const total = photos.length;
  const photo = photos[index];

  const goPrev = useCallback(() => onIndexChange((index - 1 + total) % total), [index, total, onIndexChange]);
  const goNext = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose, goPrev, goNext]);

  if (!open || !photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("ariaPhotoView")}
      className={cn("fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4", className)}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20 transition-colors cursor-pointer"
      >
        ✕
      </button>

      <div className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {total > 1 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label={t("ariaPrevPhoto")}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
          >
            ‹
          </button>
        )}
        <img src={photo.src} alt={photo.alt} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
        {total > 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label={t("ariaNextPhoto")}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
          >
            ›
          </button>
        )}
      </div>

      <div className="mt-4 max-w-2xl w-full text-center text-white" onClick={(e) => e.stopPropagation()}>
        {photo.caption && <p className="text-sm">{photo.caption}</p>}
        {total > 1 && <p className="text-[11px] text-white/60 mt-1 tabular-nums">{index + 1} / {total}</p>}
      </div>
    </div>
  );
}
