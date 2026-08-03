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

// 사진 위에 뜨는 좌우 버튼 — 어두운 배경 위이므로 링도 흰색이어야 보인다
const navBtn = cn(
  "absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 text-white backdrop-blur cursor-pointer",
  "ring-1 ring-white/15 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)]",
  "transition-colors hover:bg-white/30 active:bg-white/40",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
);

/**
 * 사진 슬라이드쇼 — 자동재생/수동 컨트롤/키보드 지원.
 * @example
 * <PhotoCarousel photos={photos} autoPlayMs={4000} />
 * @status stable
 * @since 2.4.0
 * @tags photo, media
 */
export function PhotoCarousel({
  photos,
  autoPlayMs = 0,
  showIndicators = true,
  aspectRatio = "16 / 9",
  className,
}: PhotoCarouselProps) {
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
  const prev = useCallback(
    () => setIndex((i) => (total > 0 ? (i - 1 + total) % total : 0)),
    [total],
  );

  useEffect(() => {
    if (!autoPlayMs || paused || total <= 1) return;
    const id = setInterval(next, autoPlayMs);
    return () => clearInterval(id);
  }, [autoPlayMs, paused, total, next]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
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
      className={cn(
        "relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      style={{ aspectRatio }}
    >
      {photos.map((p, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          <img src={p.src} alt={p.alt} className="w-full h-full object-cover" />
          {p.caption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent px-4 pt-10 pb-4 text-white text-sm">
              {p.caption}
            </div>
          )}
        </div>
      ))}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label={t("ariaPrevPhoto")}
            className={cn(navBtn, "left-3")}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t("ariaNextPhoto")}
            className={cn(navBtn, "right-3")}
          >
            ›
          </button>
          {showIndicators && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-0.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={t("ariaPhotoNumber", { n: i + 1 })}
                  aria-current={i === index ? "true" : undefined}
                  // 점 자체는 6px 이라 손가락으로 못 누른다 — 히트 영역은 버튼이, 모양은 안쪽 span 이 맡는다
                  className="group flex h-5 w-4 items-center justify-center rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  <span
                    className={cn(
                      // 폭이 변하는 알약이다 — transition-all 로 두면 위치까지 함께 흐른다
                      "h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out motion-reduce:transition-none",
                      i === index
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/50 group-hover:bg-white/80 group-active:bg-white",
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
