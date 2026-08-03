"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import { ChapterList } from "../../composites/ChapterList";
import type { Chapter } from "../../composites/ChapterList";
import { ReadingProgress } from "../../composites/ReadingProgress";
import { BookmarkButton } from "../../primitives/BookmarkButton";
import { ScrollProgress } from "../../composites/ScrollProgress";
import { useT } from "../../providers/I18nProvider";
import type { ReactNode } from "react";

export interface BookReaderProps {
  /** 책 제목 */
  title: string;
  /** 저자 */
  author?: string;
  /** 챕터 트리 */
  chapters: Chapter[];
  /** 활성 챕터 id */
  activeChapterId: string;
  /** 활성 챕터 변경 콜백 */
  onChapterChange: (id: string) => void;
  /** 본문 (현재 챕터 콘텐츠) */
  children: ReactNode;
  /** 현재 페이지 */
  currentPage: number;
  /** 총 페이지 */
  totalPages: number;
  /** 북마크 상태 */
  bookmarked?: boolean;
  /** 북마크 토글 */
  onBookmarkChange?: (next: boolean) => void;
  /** 닫기 콜백 */
  onClose?: () => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 책 리더 — 좌측 챕터 목차 + 우측 본문 + 상단 진행률 + 하단 페이지 네비.
 * @example
 * <BookReader title="모비 딕" chapters={chs} activeChapterId={id} onChapterChange={setId}
 *   currentPage={86} totalPages={312} bookmarked={b} onBookmarkChange={setB}>
 *   <article>본문…</article>
 * </BookReader>
 * @status stable
 * @since 2.4.0
 * @tags book, layout
 */
export const BookReader = forwardRef<HTMLElement, BookReaderProps>(function BookReader(
  {
    title,
    author,
    chapters,
    activeChapterId,
    onChapterChange,
    children,
    currentPage,
    totalPages,
    bookmarked,
    onBookmarkChange,
    onClose,
    className,
  },
  ref,
) {
  const t = useT();
  const [tocOpen, setTocOpen] = useState(true);

  if (chapters.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[JunDS] BookReader: chapters가 비어 있어 렌더하지 않습니다.");
    }
    return null;
  }

  return (
    <article ref={ref} className={cn("relative bg-surface min-h-screen", className)}>
      <ScrollProgress position="top" thickness={2} aria-label="페이지 스크롤 진행률" />

      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTocOpen((o) => !o)}
            aria-label={tocOpen ? t("ariaTocHide") : t("ariaTocShow")}
            aria-expanded={tocOpen}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-surface-soft active:bg-border-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            ☰
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
            {author && <p className="text-[11px] text-muted truncate">{author}</p>}
          </div>
          {onBookmarkChange && (
            <BookmarkButton bookmarked={!!bookmarked} onChange={onBookmarkChange} />
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-surface-soft hover:text-danger active:bg-border-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              ✕
            </button>
          )}
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-2">
          <ReadingProgress compact currentPage={currentPage} totalPages={totalPages} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[260px_1fr] gap-6">
        {tocOpen && (
          <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] min-w-0 overflow-y-auto overscroll-y-contain pr-2">
            <ChapterList
              chapters={chapters}
              activeId={activeChapterId}
              onSelect={(c) => onChapterChange(c.id)}
            />
          </aside>
        )}
        <main className="min-w-0 prose prose-neutral dark:prose-invert max-w-none">{children}</main>
      </div>
    </article>
  );
});
BookReader.displayName = "BookReader";
