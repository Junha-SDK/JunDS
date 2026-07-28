"use client";
import { forwardRef, useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import { PhotoCard } from "../../composites/PhotoCard";
import { PhotoGrid } from "../../composites/PhotoGrid";
import type { PhotoGridLayout } from "../../composites/PhotoGrid";
import { PhotoLightbox } from "../../composites/PhotoLightbox";
import type { LightboxPhoto } from "../../composites/PhotoLightbox";
import { EmptyState } from "../../composites/EmptyState";

export interface PhotoAlbumItem {
  id: string;
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  /** 분류 태그 (필터 칩에 노출) */
  tag?: string;
  likes?: number;
  comments?: number;
}

export interface PhotoAlbumProps {
  /** 사진 목록 */
  photos: PhotoAlbumItem[];
  /** 그리드 레이아웃 */
  layout?: PhotoGridLayout;
  /** 컬럼 수 */
  columns?: 2 | 3 | 4 | 5;
  /** 앨범 제목 */
  title?: string;
  /** 비었을 때 메시지 */
  emptyTitle?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 사진 앨범 — 태그 필터 + 그리드 + 라이트박스 자동 연결.
 * @example
 * <PhotoAlbum title="2026 여행" photos={photos} layout="masonry" columns={4} />
 * @status stable
 * @since 2.4.0
 * @tags photo, layout
 */
export const PhotoAlbum = forwardRef<HTMLElement, PhotoAlbumProps>(function PhotoAlbum(
  { photos, layout = "masonry", columns = 4, title, emptyTitle = "사진이 없습니다", className },
  ref,
) {
  const [tag, setTag] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const p of photos) if (p.tag) set.add(p.tag);
    return [...set];
  }, [photos]);

  const filtered = useMemo(
    () => (tag ? photos.filter((p) => p.tag === tag) : photos),
    [photos, tag],
  );

  const lightboxPhotos: LightboxPhoto[] = filtered.map((p) => ({
    src: p.src,
    alt: p.alt,
    caption: p.caption ?? p.title,
  }));

  return (
    <section ref={ref} className={cn("space-y-4", className)} aria-label={title ?? "사진 앨범"}>
      <header className="flex items-center justify-between">
        {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
        <p className="text-xs text-muted">{filtered.length}장</p>
      </header>

      {tags.length > 0 && (
        <div role="radiogroup" aria-label="태그 필터" className="flex flex-wrap gap-2">
          <button
            type="button"
            role="radio"
            aria-checked={tag === null}
            onClick={() => setTag(null)}
            className={cn(
              // 필터 칩에 포커스 표시가 없어 키보드로는 어느 칩에 있는지 알 수 없었다.
              // 활성/비활성 모두 테두리를 둬야 전환할 때 1px 씩 밀리지 않는다.
              "inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer",
              "active:scale-[0.97] motion-reduce:active:scale-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              tag === null
                ? "bg-primary border-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                : "bg-surface-soft border-border text-foreground hover:bg-surface hover:border-muted-light",
            )}
          >
            전체
          </button>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tag === t}
              onClick={() => setTag(t)}
              className={cn(
                "inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer",
                "active:scale-[0.97] motion-reduce:active:scale-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                tag === t
                  ? "bg-primary border-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                  : "bg-surface-soft border-border text-foreground hover:bg-surface hover:border-muted-light",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="📷" title={emptyTitle} />
      ) : (
        <PhotoGrid layout={layout} columns={columns} gap={2}>
          {filtered.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setLightboxIndex(i)}
              aria-label={`${p.alt} 크게 보기`}
              className="block w-full text-left cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <PhotoCard
                src={p.src}
                alt={p.alt}
                title={p.title}
                meta={p.caption}
                likes={p.likes}
                comments={p.comments}
                interactive
              />
            </button>
          ))}
        </PhotoGrid>
      )}

      <PhotoLightbox
        open={lightboxIndex !== null}
        photos={lightboxPhotos}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </section>
  );
});
PhotoAlbum.displayName = "PhotoAlbum";
