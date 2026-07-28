# Recipe — Book Reader Page

## Goal

웹 기반 책 리더의 한 화면 — 좌측 목차 + 우측 본문 + 상단 진행률 + 하단 통계.
사용자가 챕터를 오가며 메모를 남기고 책장을 탐색할 수 있다.

## Used components

- `BookReader` — `@/ds/patterns/BookReader` (전체 컨테이너)
- `ChapterList` — `@/ds/composites/ChapterList`
- `ReadingProgress` — `@/ds/composites/ReadingProgress`
- `BookmarkButton` — `@/ds/primitives/BookmarkButton`
- `ScrollProgress` — `@/ds/composites/ScrollProgress`
- `AnnotationNote` — `@/ds/composites/AnnotationNote`
- `useReadingProgress` — `@/ds/hooks/useReadingProgress`

## Recipe

```tsx
"use client";
import { useState, useMemo } from "react";
import { BookReader } from "@/ds/patterns/BookReader";
import { AnnotationNote } from "@/ds/composites/AnnotationNote";
import { useReadingProgress } from "@/ds/hooks/useReadingProgress";
import type { Chapter } from "@/ds/composites/ChapterList";

const chapters: Chapter[] = [
  { id: "ch-1", title: "1장. 서문", page: 1, durationMinutes: 8 },
  { id: "ch-2", title: "2장. 첫 항해", page: 28, durationMinutes: 22 },
  { id: "ch-3", title: "3장. 노이즈", page: 86, durationMinutes: 18 },
  { id: "ch-4", title: "4장. 폭풍", page: 142, durationMinutes: 30 },
  { id: "ch-5", title: "5장. 결말", page: 220, durationMinutes: 12, locked: true },
];

interface BookData {
  title: string;
  author: string;
  totalPages: number;
}

export default function BookReaderPage({ book }: { book: BookData }) {
  const [active, setActive] = useState("ch-3");
  const [bookmarked, setBookmarked] = useState(true);
  const [annotations, setAnnotations] = useState<
    { id: string; quote: string; note?: string; page: number }[]
  >([
    {
      id: "a1",
      quote: "그가 보지 않은 모든 것이 노이즈였다.",
      note: "이 부분 인용",
      page: 89,
    },
  ]);

  const { activeHeadingId } = useReadingProgress();
  const currentChapter = useMemo(() => chapters.find((c) => c.id === active), [active]);
  const currentPage = currentChapter?.page ?? 1;

  return (
    <BookReader
      title={book.title}
      author={book.author}
      chapters={chapters}
      activeChapterId={active}
      onChapterChange={setActive}
      currentPage={currentPage}
      totalPages={book.totalPages}
      bookmarked={bookmarked}
      onBookmarkChange={setBookmarked}
    >
      <header>
        <h1 id="title">{currentChapter?.title}</h1>
        <p className="text-muted text-sm">{book.author}</p>
      </header>

      <h2 id="opening">시작</h2>
      <p>나를 이슈마엘이라 불러라. 정확히 몇 해 전인지는 그리 중요하지 않다…</p>
      <p>
        여기 본문이 길게 이어진다. <code>useReadingProgress</code>가 화면에 보이는 헤딩을
        자동으로 추적해 사이드바 TOC와 연동할 수 있다.
      </p>

      <h2 id="middle">본론</h2>
      <p>중간 본문…</p>

      {annotations.length > 0 && (
        <aside className="not-prose mt-8 space-y-2">
          <h3 className="text-sm font-semibold text-muted">내 메모</h3>
          {annotations.map((a) => (
            <AnnotationNote
              key={a.id}
              quote={a.quote}
              note={a.note}
              page={a.page}
              color="yellow"
              onDelete={() => setAnnotations((arr) => arr.filter((x) => x.id !== a.id))}
            />
          ))}
        </aside>
      )}

      <p className="text-xs text-muted mt-4">활성 헤딩: {activeHeadingId ?? "-"}</p>
    </BookReader>
  );
}
```

## Variations

- **밤 읽기 모드**: `BookReader`에 `className="bg-stone-900 text-stone-50"` + 본문 prose dark
- **여러 권 동시 열기**: `BookReader`를 `Tabs` 안에 배치, 각 탭이 한 권을 담당
- **TOC 자동 추적**: 본문 헤딩에 `id` 부여 + `useReadingProgress`의 `activeHeadingId`를 `ChapterList.activeId`로 매핑

## See also

- `requirements/design-system-library.md`
- `app/design-system/patterns/book-reader/page.tsx` — 쇼케이스
- `.ai/recipes/blog-article.md` — 짧은 글 변형
