# 06. 서재 (book)

[← 목차](../USAGE-MYSELF.md) · [← 05 데일리](05-daily.md)

MySelf 대응: `features/book/components/{BookArtIndex,BookCard,BookDetail,ChapterList,InfoCard,Markdown,Reader,bookDive}`

## 1. 목록 — `BookShelf` + `BookCard`

```tsx
import { BookShelf, BookCard } from "@junds/ui/composites";

<BookShelf columns={4} variant="grid" label="쓴 것들">
  {works.map((w) => (
    <BookCard
      key={w.slug}
      title={w.title}
      author={w.author}
      coverImage={w.cover}
      kind={getWorkKindMeta(w.kind).label}   // "소설" · "시" · "에세이"
      locked={w.locked}
      onClick={() => navigate(`/book/${w.slug}`)}
    />
  ))}
</BookShelf>
```

`locked` 를 주면 잠금 표시가 붙는다 — MySelf 의 암호화된 작품(`encrypted/`)에 쓴다.
실제 잠금 해제(문제은행 + Argon2id)는 MySelf 에 남는다.

## 2. 표지 — `BookCover`

표지만 따로 쓸 때. 이미지가 없으면 제목·저자로 표지를 그린다.

```tsx
import { BookCover } from "@junds/ui/composites";

<BookCover
  src={work.cover}
  title={work.title}
  author={work.author}
  size="lg"
  effect="shadow"
  hue={getCategoryColor("book").accent}   // 생성 표지의 색조
/>
```

## 3. 리더 — `BookReader`

MySelf 의 `Reader`(265줄)를 대체한다. 좌측 챕터 목차 + 본문 + 상단 진행률 + 하단 페이지
네비가 한 컴포넌트다.

```tsx
import { BookReader } from "@junds/ui/patterns";
import { MarkdownViewer } from "@junds/ui/composites";

function Reader({ work }: { work: Work }) {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [bookmarked, setBookmarked] = useLocalStorage(`bm:${work.slug}`, false);
  const chapter = work.chapters[chapterIdx];

  return (
    <BookReader
      title={work.title}
      author={work.author}
      chapters={work.chapters.map((c, i) => ({
        id: c.slug,
        title: c.title,
        page: i + 1,
      }))}
      activeChapterId={chapter.slug}
      onChapterChange={(id) =>
        setChapterIdx(work.chapters.findIndex((c) => c.slug === id))
      }
      currentPage={chapterIdx + 1}
      totalPages={work.chapters.length}
      bookmarked={bookmarked}
      onBookmarkChange={setBookmarked}
      onClose={() => navigate("/book")}
    >
      <MarkdownViewer
        content={chapter.body}
        kinsoku                             // ← 한국어 장문에는 반드시
        breaks={work.kind === "poem"}       // ← 시는 행이 곧 의미
      />
    </BookReader>
  );
}
```

`Chapter` 는 `{ id, title, page?, durationMinutes?, subChapters?, locked? }` 다 —
중첩 챕터와 잠금까지 표현된다.

## 4. 챕터 목록만 따로 — `ChapterList`

`BookReader` 없이 목차만 쓸 때(작품 상세 페이지 등).

```tsx
import { ChapterList } from "@junds/ui/composites";

<ChapterList
  chapters={chapters}
  activeId={chapter.slug}
  completedIds={readSlugs}          // Set 도 배열도 된다
  onSelect={(c) => goTo(c.id)}
/>
```

## 5. 본문 렌더 — 금칙처리가 핵심

MySelf 의 `Markdown` 컴포넌트가 하던 **금칙처리(禁則処理)** 가 JunDS 로 왔다.

### 방법 ① JunDS 렌더러

```tsx
import { MarkdownViewer } from "@junds/ui/composites";

<MarkdownViewer content={chapter.body} kinsoku breaks />
```

가볍지만 자주 쓰는 문법만 지원한다(제목·강조·코드·목록·링크·인용·구분선).
**표·각주·중첩 목록은 지원하지 않는다.**

### 방법 ② react-markdown 을 유지하고 금칙처리만 빌려 오기 — MySelf 권장

MySelf 본문은 `react-markdown` + `remark-gfm` 으로 이미 잘 돌아간다. 렌더러를 바꾸는 건
위험 대비 이득이 적으니, **플러그인만 가져온다.**

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { remarkKinsoku } from "@junds/ui/utils";

<ReactMarkdown remarkPlugins={[remarkGfm, remarkKinsoku]}>
  {source}
</ReactMarkdown>

{/* 시 */}
<ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkKinsoku]}>
  {source.trim()}
</ReactMarkdown>
```

`remarkKinsoku` 는 mdast 의 **텍스트 노드에만** 적용되므로 코드 블록·URL 은 건드리지 않는다.
MySelf 의 기존 구현과 동작이 같다.

### 금칙처리가 무엇을 하나

행 첫머리에 오면 안 되는 문장부호(`. , ! ? : ; ) ] } … 」 』 ） 》 〉 、 。 ·`) 앞에
word joiner(U+2060)를 끼워 그 자리에서 줄바꿈을 막는다. 폭 0 의 보이지 않는 문자라
레이아웃·선택·검색에 영향이 없다.

```
금칙처리 없음                     금칙처리 있음
─────────────────────            ─────────────────────
그는 아무 말도 하지 않았다         그는 아무 말도 하지 않았다.
.                                 (마침표가 앞 글자에 붙어 있다)
```

유틸도 직접 쓸 수 있다.

```tsx
import { applyKinsoku, applyKinsokuToHtml, stripKinsoku } from "@junds/ui/utils";

applyKinsoku("끝났다.")                    // "끝났다⁠."  (문자열)
applyKinsokuToHtml("<p>끝났다.</p>")       // 태그·<code> 바깥 텍스트만
stripKinsoku(text)                         // 되돌리기 — 클립보드·검색 인덱스에 넣기 전
```

> **`stripKinsoku` 를 잊지 말 것.** 처리된 본문을 그대로 복사하면 보이지 않는 문자가
> 함께 복사된다. 검색 인덱스에 넣을 때도 마찬가지 — 사용자가 "끝났다."로 검색하면
> word joiner 가 낀 본문과 매칭되지 않는다.

## 6. 정보 카드 — `Card`

MySelf 의 `InfoCard`(15줄)는 `Card` 로 충분하다.

```tsx
import { Card, KeyValueGrid } from "@junds/ui/composites";

<Card>
  <Card.Header>작품 정보</Card.Header>
  <Card.Body>
    {/* KeyValueItem 은 { key, label, value, span? } — key 는 고유 id, 화면에 보이는 건 label */}
    <KeyValueGrid
      columns={2}
      items={[
        { key: "kind", label: "분류", value: kindMeta.label },
        { key: "length", label: "분량", value: `${work.chapters.length}장` },
        { key: "period", label: "집필", value: work.period },
      ]}
    />
  </Card.Body>
</Card>
```

## 7. 읽기 진행률

```tsx
import { ReadingProgress } from "@junds/ui/composites";
import { useReadingProgress } from "@junds/ui/hooks";

// ① 컴포넌트 — 페이지 기반
<ReadingProgress
  currentPage={chapterIdx + 1}
  totalPages={work.chapters.length}
  chapter={chapter.title}
  remainingMinutes={estimateRemaining(work, chapterIdx)}
/>

// ② 훅 — 스크롤 기반 (상단 진행 바)
const { progress } = useReadingProgress({ target: ".article__body" });
<div className="fixed inset-x-0 top-0 h-0.5 bg-primary" style={{ width: `${progress}%` }} />
```

## 8. 읽기 통계

`BarList` 와 `StatsGrid` 로 조립한다 — [05 §4](05-daily.md) 와 같은 방식이다.

```tsx
<StatsGrid
  columns={3}
  stats={[
    { label: "쓴 작품", value: works.length },
    { label: "총 장", value: totalChapters },
    { label: "총 글자", value: totalChars.toLocaleString() },
  ]}
/>

<BarList items={byKind} sorted formatValue={(v) => `${v}편`} color="var(--cat-book)" />
```

## 9. 잠금 화면

MySelf 의 `OriginalsGate` / 관리자 권한 모달은 인증 구현(문제은행 + Argon2id/GCM)에
묶여 있어 이식하지 않았다. 껍데기는 JunDS 로 짓고 검증만 MySelf 코드를 부른다.

```tsx
import { Card, FormField } from "@junds/ui/composites";
import { Input, Button } from "@junds/ui/primitives";

<Card>
  <Card.Body>
    <p className="text-sm text-muted">잠긴 글입니다</p>
    {!open ? (
      <Button onClick={() => setOpen(true)}>잠금 해제</Button>
    ) : (
      <form onSubmit={handleSubmit}>
        <FormField label={question.prompt} error={error}>
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder}
            inputMode={question.inputMode}
          />
        </FormField>
        <Button type="submit" disabled={pending}>확인</Button>
      </form>
    )}
  </Card.Body>
</Card>
```

`makeUnlockVerify`·`checkRateLimit` 등은 MySelf 의 `features/book/auth/permission` 그대로.

---

[← 05 데일리](05-daily.md) · [다음: 07 포트폴리오·음악 →](07-portfolio-music.md)
