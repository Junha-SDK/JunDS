"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";

export interface CarouselPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export interface PhotoCarouselProps {
  photos: CarouselPhoto[];
  /** 자동 재생 (ms 단위, 0=꺼짐) */
  autoPlayMs?: number;
  /** 인디케이터 점 표시 */
  showIndicators?: boolean;
  /** 종횡비 */
  aspectRatio?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 사진 슬라이드쇼 — 자동재생/수동 컨트롤/키보드 지원.
 * @example
 * <PhotoCarousel photos={photos} autoPlayMs={4000} />
 * @status stable
 * @since 2.4.0
 * @tags photo, media
 */
export function PhotoCarousel({ photos, autoPlayMs = 0, showIndicators = true, aspectRatio = "16 / 9", className }: PhotoCarouselProps) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = photos.length;
  const ref = useRef<HTMLDivElement>(null);

  // Clamp the active index whenever `photos` shrinks below the previous index.
  useEffect(() => {
    if (total > 0 && index >= total) setIndex(0);
  }, [total, index]);

  const next = useCallback(() => setIndex((i) => (total > 0 ? (i + 1) % total : 0)), [total]);
  const prev = useCallback(() => setIndex((i) => (total > 0 ? (i - 1 + total) % total : 0)), [total]);

  useEffect(() => {
    if (!autoPlayMs || paused || total <= 1) return;
    const id = setInterval(next, autoPlayMs);
    return () => clearInterval(id);
  }, [autoPlayMs, paused, total, next]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  };

  if (total === 0) return null;

  return (
    <div
      ref={ref}
      role="region"
      aria-label="사진 슬라이드쇼"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn("relative overflow-hidden rounded-xl bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", className)}
      style={{ aspectRatio }}
    >
      {photos.map((p, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={cn("absolute inset-0 transition-opacity duration-500", i === index ? "opacity-100" : "opacity-0")}
        >
          <img src={p.src} alt={p.alt} className="w-full h-full object-cover" />
          {p.caption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-sm">
              {p.caption}
            </div>
          )}
        </div>
      ))}

      {total > 1 && (
        <>
          <button type="button" onClick={prev} aria-label={t("ariaPrevPhoto")} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 transition-colors cursor-pointer">‹</button>
          <button type="button" onClick={next} aria-label={t("ariaNextPhoto")} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 transition-colors cursor-pointer">›</button>
          {showIndicators && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={t("ariaPhotoNumber", { n: i + 1 })}
                  aria-current={i === index ? "true" : undefined}
                  className={cn("w-1.5 h-1.5 rounded-full transition-all", i === index ? "bg-white w-5" : "bg-white/50 hover:bg-white/80")}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
