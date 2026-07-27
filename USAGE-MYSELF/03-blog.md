# 03. 블로그

[← 목차](../USAGE-MYSELF.md) · [← 02 셸·SEO](02-shell-seo.md)

MySelf 대응: `features/blog/components/{BlogLayout,BlogList,BlogMeta,BlogNav,BlogRelated,BlogToc,SelectDropdown}`

## 1. 목록 페이지

`SelectDropdown` → `Select`, 필터 상태 → `useUrlFilters`.

```tsx
import { Select } from "@junds/ui/composites";
import { SearchBar } from "@junds/ui/composites";
import { useUrlFilters } from "@junds/ui/hooks";

function BlogList({ posts }: { posts: Post[] }) {
  const { filters, set, reset, activeCount } = useUrlFilters({
    category: "all",
    sort: "desc",
    q: "",
  });

  const visible = useMemo(
    () => filterPosts(posts, filters), // 필터링 로직은 MySelf 몫
    [posts, filters],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={filters.q} onChange={(v) => set("q", v)} debounceMs={150} />
        <Select
          value={filters.category}
          onChange={(v) => set("category", v)}
          options={CATEGORY_OPTIONS}
        />
        <Select
          value={filters.sort}
          onChange={(v) => set("sort", v)}
          options={[
            { value: "desc", label: "최신순" },
            { value: "asc", label: "오래된순" },
          ]}
        />
        {activeCount > 0 && (
          <button onClick={reset}>필터 {activeCount}개 해제</button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="글이 없습니다" description="다른 조건으로 찾아보세요" />
      ) : (
        visible.map((p) => <PostRow key={p.id} post={p} />)
      )}
    </>
  );
}
```

**`useUrlFilters` 가 지키는 두 규칙:**

- **기본값과 같은 필터는 URL 에 싣지 않는다.** 아무것도 안 건드린 목록의 주소가 `/blog` 로
  깨끗하게 남고, 공유한 링크에는 실제로 바꾼 조건만 담긴다.
- **replace 가 기본.** 필터를 다섯 번 만졌다고 뒤로 가기를 다섯 번 눌러야 하는 함정이 없다.
  히스토리에 남겨야 하면 `{ push: true }`.

값 검증이 필요하면(URL 은 사용자가 손으로 고칠 수 있다) `parse` 를 준다.

```tsx
useUrlFilters(
  { sort: "desc" },
  { parse: { sort: (raw) => (raw === "asc" || raw === "desc" ? raw : undefined) } },
);
```

`undefined` 를 돌려주면 그 키는 기본값으로 되돌아간다.

로컬 전용 필터(작성 상태 등)는 `transient` 로 URL 에서 뺀다 — 배포 주소에 새지 않는다.

```tsx
useUrlFilters({ status: "all", q: "" }, { transient: ["status"] });
```

## 2. 글 레이아웃

```tsx
import { Container, Stack } from "@junds/ui/layout";
import { TableOfContents, ReadingTime, RelatedPosts } from "@junds/ui/composites";
import { GlobalImageLightbox } from "@junds/ui/composites";
import { useCodeCopy, useReadingProgress } from "@junds/ui/hooks";

function BlogArticle({ post, related, html }: Props) {
  useCodeCopy(".article__body", [post.id], { blockSelector: "pre.codebox" });
  const { progress } = useReadingProgress({ target: ".article__body" });

  return (
    <>
      <SeoHead title={post.title} description={post.summary} ogType="article" />
      <GlobalImageLightbox rootSelector=".article__body" />

      <div className="fixed inset-x-0 top-0 h-0.5 bg-primary" style={{ width: `${progress}%` }} />

      <div className="flex gap-8">
        <Container size="md">
          <Stack gap="lg">
            <h1>{post.title}</h1>
            <PostMeta post={post} html={html} />
            <div
              className="blog-article article__body"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <RelatedPosts posts={related} renderLink={routerLink} />
          </Stack>
        </Container>

        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <TableOfContents
              rootSelector=".article__body"
              selector="h2, h3"
              exclude=".dup-title--visually-hidden"
              scrollOffset={76}
              observe
            />
          </div>
        </aside>
      </div>
    </>
  );
}
```

## 3. 목차 — `TableOfContents`

MySelf 의 `BlogToc` + `AutoTocRegistrar` 를 대체한다.

```tsx
<TableOfContents
  rootSelector=".article__body"
  selector="h2, h3"
  exclude=".dup-title--visually-hidden"  // 숨김 중복 제목 제외
  scrollOffset={76}                       // 고정 헤더 높이
  observe                                 // 기본 true — 지연 도착 본문 재수집
  emptyFallback={<p className="text-muted">목차 없음</p>}
  onItemsChange={(items) => setHasToc(items.length > 0)}
/>
```

**`observe` 가 핵심이다.** MySelf 는 글 본문을 lazy import 하므로 마운트 시점에 헤딩이
하나도 없다. MutationObserver 로 DOM 변화를 지켜보다 본문이 도착하면 다시 수집한다 —
이게 없으면 목차가 영영 비어 있다. (본문이 이미 전부 있는 화면이라면 `observe={false}` 가
약간 싸다.)

그 밖에:

- **id 없는 헤딩에 슬러그를 붙인다.** 같은 제목이 여러 번 나와도 `-2`, `-3` 을 덧붙여
  id 가 겹치지 않는다.
- **클릭 시 `scrollspy:manual` 이벤트를 쏜다.** `useScrollSpy` 가 이걸 듣고 700ms 동안
  관찰을 멈춰, 스크롤이 흐르는 동안 활성 항목이 중간 섹션들을 훑으며 깜빡이지 않는다.
- **`scrollOffset`** 을 주면 `scrollIntoView` 대신 계산 스크롤을 써서 고정 헤더에 제목이
  가려지지 않는다.

### 헤딩을 React 로 렌더하는 경우

본문이 HTML 문자열이 아니라 컴포넌트라면 `TocProvider` + `TocHeading` 이 낫다. DOM 을
훑는 대신 헤딩이 스스로 등록하므로, 본문이 늦게 와도 순서가 문서 순서로 보장된다.

```tsx
import { TocProvider, useToc, TocReady } from "@junds/ui/providers";
import { TocHeading, TableOfContents } from "@junds/ui/composites";

<TocProvider>
  <aside><Outline /></aside>
  <article>
    <Suspense fallback={<Skeleton lines={12} />}>
      <PostBody />   {/* 안에서 <TocHeading level={2}>…</TocHeading> */}
      <TocReady />   {/* 본문이 커밋된 순간 ready 가 켜진다 */}
    </Suspense>
  </article>
</TocProvider>

function Outline() {
  const toc = useToc();
  if (!toc) return null;
  // ready 전의 "0개"는 "목차 없는 글"이 아니라 "아직 본문이 안 왔음"이다
  if (!toc.ready) return <Skeleton lines={5} />;
  return <TableOfContents items={toc.items} />;
}
```

`useToc()?.items` 는 `TableOfContents` 의 `items` 와 구조가 같아 그대로 넘길 수 있다.

## 4. 글 메타 — `ReadingTime`

MySelf 의 `BlogMeta` 를 조립한다.

```tsx
import { ReadingTime } from "@junds/ui/composites";
import { Tag } from "@junds/ui/primitives";

function PostMeta({ post, html }: { post: Post; html: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      {post.date && <time dateTime={post.date}>{post.date}</time>}
      {post.tag && <Tag>{post.tag.toUpperCase()}</Tag>}
      {post.source && <span>with {post.source}</span>}
      <span className="ml-auto">
        <ReadingTime
          content={html}
          showDifficulty
          wpm={170}       // ← MySelf 의 기존 수치
          cpm={280}
          minMinutes={2}
        />
      </span>
    </div>
  );
}
```

> **읽기 속도를 반드시 넘긴다.** JunDS 기본값은 라틴 230wpm / CJK 170cpm 인데, MySelf 는
> 170wpm / 280cpm 으로 계산해 왔다. 한국어 3000자 글에서 17.6분 대 10.7분으로 갈린다.
> 세 값(`wpm`·`cpm`·`minMinutes`)을 넘기면 지금 표시되는 숫자가 그대로 재현된다.
> 이참에 JunDS 기본값으로 옮기고 싶다면 세 prop 을 빼면 된다 — 표시 시간이 길어진다.

`content` 는 HTML 이어도 되고 평문이어도 된다(태그는 제거하고 센다). 난이도는 본문 안의
`<h2>`/`<h3>` 개수를 함께 보는데, 본문이 DOM 에만 있으면 `headingCount` 로 직접 넘긴다.

## 5. 연관 글 — `RelatedPosts`

```tsx
<RelatedPosts
  posts={related.map((p) => ({ id: p.id, title: p.title, category: p.category }))}
  title="연관 글 읽기"
  max={4}
  columns={2}
  renderLink={routerLink}
/>
```

- `href` 를 안 주면 `id` 를 링크로 쓴다 — MySelf 의 글 id 가 곧 경로라 그대로 맞는다.
- **목록이 비면 섹션째 사라진다.** "연관 글 읽기"라는 제목만 덩그러니 남는 일이 없다.
- 어떤 글이 연관인지 고르는 일(`getRelated()`)은 MySelf 에 남는다 — 콘텐츠의 몫이다.

## 6. 코드 블록 복사 — `useCodeCopy`

```tsx
useCodeCopy(".article__body", [post.id], {
  blockSelector: "pre.codebox",  // MySelf 의 md2tsx 산출물 클래스
  label: "복사",
  copiedLabel: "복사됨",
});
```

빌드 타임에 HTML 로 굳힌 본문에는 코드 블록마다 걸어 둘 React 컴포넌트가 없다. 이 훅은
렌더가 끝난 뒤 DOM 을 직접 보강한다.

- **멱등이다.** `data-copy-ready` 로 두 번 붙지 않는다.
- **본문이 lazy 하게 와도 잡는다** — 즉시 / 다음 프레임 / 300ms 후 세 번 시도.
- 언마운트 시 주입한 버튼과 리스너를 전부 걷어낸다.
- 버튼 CSS(`.jds-code-copy-btn`)는 `styles.css` 에 들어 있다. hover 로 나타나고,
  터치 기기에서는 상시 노출된다.

두 번째 인자는 의존성 배열이다 — 글이 바뀔 때마다 다시 주입해야 하므로 `[post.id]`.

## 7. 본문 안의 콜아웃 · 스포일러

```tsx
import { Callout, SpoilerBlock } from "@junds/ui/composites";

<Callout variant="info" title="알려드립니다">본문</Callout>
<Callout variant="warn">…</Callout>      {/* warning 의 별칭 */}
<Callout variant="success">…</Callout>
<Callout variant="tip" collapsible>기본 접힘</Callout>
```

variant 는 `note` · `info` · `tip` · `success` · `warning`(`warn`) · `danger`.
MySelf 의 `info|warn|success|tip` 이 전부 들어 있다.

```tsx
<SpoilerBlock
  type="spoiler"                      // "caution" | "youth"(=caution 별칭)
  notice="스포일러가 포함된 내용입니다"  // null 이면 문구 없이 버튼만
  onReveal={() => track("spoiler_reveal", post.id)}
>
  <MarkdownViewer content={hidden} kinsoku />
</SpoilerBlock>
```

`<스포일러>…</스포일러>` 토큰을 파싱하는 `parseSpoilerSegments` 는 MySelf 에 남는다 —
콘텐츠 저작 규약이지 디자인 시스템이 아니다. 파싱 결과를 이 컴포넌트에 꽂아 쓴다.

## 8. 이전/다음 글

```tsx
import { DocPager } from "@junds/ui/composites";

<DocPager
  prev={prev && { href: prev.id, title: prev.title, description: prev.category }}
  next={next && { href: next.id, title: next.title, description: next.category }}
  prevLabel="이전 글"
  nextLabel="다음 글"
  renderLink={routerLink}
/>
```

한쪽만 있으면 나머지 자리를 비워 둔다 — "다음"이 항상 오른쪽에 오도록. 위치가 방향을
알려주는 단서라서다. 둘 다 없으면 아무것도 렌더하지 않는다.

## 9. 로딩 상태

MySelf 의 `PostSkeleton` 은 `Skeleton` 으로 대체한다.

```tsx
import { Skeleton } from "@junds/ui/composites";

<Suspense
  fallback={
    <Stack gap="md">
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="30%" height={16} />
      <Skeleton lines={14} />
    </Stack>
  }
>
  <PostBody />
</Suspense>
```

`lines` 를 넉넉히 잡아 본문 높이를 미리 확보하는 것이 중요하다 — 5000~8000px 짜리 본문이
갑자기 들어오면 레이아웃이 크게 흔들린다.

---

[← 02 셸·SEO](02-shell-seo.md) · [다음: 04 독스 →](04-docs.md)
