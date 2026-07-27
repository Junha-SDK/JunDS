# 02. 앱 셸 · 테마 · SEO · 검색

[← 목차](../USAGE-MYSELF.md) · [← 01 설치](01-setup.md)

MySelf 대응: `app/layout/{SiteHeader,SiteFooter,WithChrome}` · `core/seo/*` ·
`core/search/*` · `app/providers/*` · `core/ui/Header`

## 1. 앱 셸 — `AppShell`

`AppShell` 은 사이드바·헤더·본문·푸터 골격을 잡고, 데스크톱 접힘과 모바일 오버레이
드로어를 내장한다. 독스처럼 좌측 트리가 있는 화면에 쓴다.

```tsx
import { AppShell } from "@junds/ui/layout";

<AppShell
  header={<SiteHeader />}
  sidebar={<DocsNav />}
  footer={<SiteFooter />}
  sidebarWidth={280}
  collapsedWidth={64}
  sidebarCollapsed={collapsed}
  onSidebarToggle={setCollapsed}
  mobileBreakpoint={900}
  stickyHeader
  contentPadding={{ base: 4, md: 8 }}
>
  <Outlet />
</AppShell>
```

**사이드바가 없는 화면**(블로그 목록·홈·포트폴리오)은 `AppShell` 을 쓰지 말고
`Container` 로 폭만 잡는다 — 빈 사이드바 칸이 레이아웃을 흔든다.

```tsx
import { Container, Stack } from "@junds/ui/layout";

<Container size="md" px={{ base: 4, md: 6 }}>
  <Stack gap="xl">{children}</Stack>
</Container>
```

`size` 는 `xs`(512) · `sm`(640) · `md`(768) · `lg`(1024) · `xl` · `2xl` · `full`.
MySelf 의 본문 폭(≈720px)에는 `md` 가 맞는다.

## 2. 포커스 모드 — `useFocusMode`

블로그·독스의 집중 모드. **MySelf 가 쓰던 두 기능은 기본이 꺼져 있으니 켠다.**

```tsx
import { useFocusMode } from "@junds/ui/hooks";

const { focusMode, peekLeft, peekRight, toggleFocusMode } = useFocusMode({
  peek: true,        // ← 마우스를 좌우 끝으로 밀면 숨긴 패널이 잠깐 나온다
  disableBelow: 900, // ← 모바일에서는 접을 사이드바가 없다
  leftZone: 280,     // 좌측 네비 폭
  rightZone: 240,    // 우측 목차 폭
});

<div className={focusMode ? "is-focus" : ""}>
  <aside className={peekLeft ? "is-peeking" : ""}>
    <DocsNav />
  </aside>
  <article>…</article>
  <aside className={peekRight ? "is-peeking" : ""}>
    <TableOfContents rootSelector=".article__body" />
  </aside>
</div>
```

| prop | MySelf 값 | 안 주면 |
|---|---|---|
| `peek` | `true` | 엣지 peek 없음 — 포커스 모드에서 목차를 볼 방법이 사라진다 |
| `disableBelow` | `900` | 모바일에서도 켜져 레이아웃이 깨진다 |
| `persist` | (기본 `true`) | localStorage `ds-focus-mode` 에 저장 |
| `shortcut` | (기본 `true`) | `Cmd/Ctrl + .` 토글 |

**JunDS 갤러리처럼 자체 전폭 UI 가 있는 화면에서는 `peek: false`.** 켜 두면 패널이
콘텐츠를 덮을 뿐 아니라 `mousemove` 마다 레이아웃 전체가 리렌더된다.

반환값에 `enabled`/`toggle` 과 `focusMode`/`toggleFocusMode` 가 둘 다 있다 — 같은 값의
별칭이니 읽기 화면 코드에서 자연스러운 쪽을 쓴다.

### 토글 버튼

MySelf 의 `FocusModeButton` 은 JunDS 에 없다(아이콘 버튼 하나라 옮길 게 없다).
`IconButton` 으로 그대로 만든다.

```tsx
import { IconButton } from "@junds/ui/primitives";

<IconButton
  onClick={toggleFocusMode}
  aria-pressed={focusMode}
  aria-label={focusMode ? "집중 모드 끄기 (⌘.)" : "집중 모드 (⌘.)"}
>
  {focusMode ? <ExitFocusIcon /> : <EnterFocusIcon />}
</IconButton>
```

## 3. 테마 토글

```tsx
import { useTheme } from "@junds/ui/providers";
import { SegmentedControl } from "@junds/ui/composites";

function ThemeToggle() {
  const { colorMode, setColorMode } = useTheme();
  return (
    <SegmentedControl
      value={colorMode}
      onChange={(v) => setColorMode(v as "light" | "dark" | "system")}
      options={[
        { value: "light", label: "밝게" },
        { value: "dark", label: "어둡게" },
        { value: "system", label: "시스템" },
      ]}
    />
  );
}
```

MySelf 는 다크 고정이므로 토글을 안 둘 수도 있다. 그 경우
`<ThemeProvider defaultColorMode="dark">` 만 두고 토글은 만들지 않는다 — 선택지를
보여 주고 하나만 동작하는 것보다 낫다.

## 4. SEO — `SeoProvider` + `SeoHead`

기본값은 [01 §3](01-setup.md) 에서 이미 한 번 넣었다. 각 페이지는 **달라지는 것만** 준다.

```tsx
import { SeoHead } from "@junds/ui/composites";

// 블로그 글
<SeoHead
  title={post.title}
  description={post.summary}
  ogImage={post.cover}          // 상대 경로면 siteUrl 이 붙어 절대 URL 이 된다
  ogType="article"
  canonical={`/blog/${post.slug}`}
  keywords={post.tags}
/>

// 목록 페이지 — 제목만
<SeoHead title="블로그" canonical="/blog" />

// 색인 제외
<SeoHead title="관리" noIndex />
```

훅으로 쓰고 싶으면 `useSeo(props)` 가 같은 일을 한다. `SeoHead` 는 그 얇은 래퍼다.

### 채워지는 항목

`document.title` · `description` · `keywords` · `robots` · canonical ·
`og:title/description/image/image:secure_url/image:alt/type/site_name/url/locale` ·
`twitter:card/site/title/description/image` · favicon · apple-touch-icon.

- **`og:image:secure_url` 을 같이 쓰는 게 중요하다.** 이 값을 우선하는 스크래퍼
  (Mattermost 등)가 있어서, 빼먹으면 `index.html` 에 박힌 홈 이미지가 모든 페이지의
  미리보기로 나간다. MySelf 가 실제로 겪은 문제다.
- **트위터 카드는 자동 판정** — 전용 커버가 있으면 `summary_large_image`, 사이트 기본
  이미지면 `summary`.
- **언마운트 시 기본값으로 되돌린다** — 이전 페이지 메타가 다음 페이지에 남지 않는다.

### 페이지별 파비콘(identicon)

MySelf 는 라우트마다 다른 identicon 을 쓴다. `favicon` prop 에 seed URL 을 넘긴다.

```tsx
const seed = pathname === "/" ? "/home" : pathname;
const base = `https://www.junome.info/api/identicon?seed=${encodeURIComponent(seed)}`;

<SeoHead
  title={title}
  favicon={`${base}&format=svg`}      // 탭에서 선명한 SVG
  appleTouchIcon={`${base}&square=1`} // iOS 호환 PNG
/>
```

> 라우트→제목 매핑(`SeoResolver`)은 MySelf 에 남는다. JunDS 는 "무엇을 넣을지"가 아니라
> "어떻게 넣을지"만 안다.

## 5. 구조화 데이터 — `useJsonLd`

```tsx
import { useJsonLd } from "@junds/ui/hooks";

useJsonLd("article", {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  datePublished: post.date,
  author: { "@type": "Person", name: "박준하" },
  image: post.cover,
});
```

- 인라인 객체 리터럴을 그대로 넘겨도 매 렌더 재주입되지 않는다(직렬화 비교).
- 같은 `key` 로 다시 호출하면 **교체**한다 — 라우트가 바뀔 때 이전 페이지의 구조화
  데이터가 남지 않는다.
- 언마운트 시 제거.

여러 개를 붙이려면 key 를 나눈다: `useJsonLd("breadcrumb", …)`, `useJsonLd("person", …)`.

## 6. 검색 팔레트 — `CommandPalette`

MySelf 의 `SearchDialog`(그룹 헤딩 + 방향키 이동)를 대체한다.

```tsx
import { CommandPalette } from "@junds/ui/patterns";
import { useHotkeys } from "@junds/ui/hooks";

const [open, setOpen] = useState(false);
useHotkeys({ "mod+k": () => setOpen(true) });

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  placeholder="글·문서·데일리 검색…"
  items={searchIndex.map((e) => ({
    id: e.id,
    label: e.title,
    group: GROUP_LABEL[e.type],   // "블로그" · "독스" · "데일리" · "서재"
    onSelect: () => navigate(e.href),
  }))}
/>
```

`group` 이 같은 항목끼리 묶여 헤딩과 함께 나온다 — MySelf 의 `groupResults()` 가 하던 일이
컴포넌트 안으로 들어갔다. 검색 인덱스(`searchIndex.ts`)는 MySelf 에 남는다.

### 인라인 검색창

목록 페이지 상단의 검색 입력은 `SearchBar` 다.

```tsx
import { SearchBar } from "@junds/ui/composites";

<SearchBar
  value={q}
  onChange={setQ}
  debounceMs={150}
  placeholder="제목·태그 검색"
  focusShortcut="mod+k"   // false 로 끄면 팔레트와 단축키가 겹치지 않는다
/>
```

## 7. 토스트

```tsx
import { useDsToast } from "@junds/ui/composites";

const toast = useDsToast();

toast.success("복사했습니다");
toast.error("불러오지 못했습니다", { action: { label: "다시", onClick: retry } });

// id 를 받아 나중에 직접 닫기
const id = toast.show({ type: "info", title: "동기화 중", message: "잠시만요", duration: 0 });
// …끝나면
toast.close(id);

// 라우트 전환 시 싹 비우기
toast.clear();
```

`confirm` 도 있다 — 배경을 가리고 응답을 받을 때까지 닫히지 않는다.

```tsx
toast.confirm("이 글을 삭제할까요?", () => remove(id), () => {});
```

**전체화면 대응이 내장이다.** `document.fullscreenElement` 가 바뀌면 포털 루트를 그쪽으로
옮기므로, 발표 모드나 전체화면 이미지 위에서도 토스트가 보인다.

## 8. 전역 이미지 라이트박스

본문 이미지를 클릭하면 확대되는 기능. MySelf 처럼 마크다운을 HTML 문자열로 굳혀 넣는
파이프라인에서는 이미지마다 컴포넌트를 감쌀 수 없으니 **위임형**을 쓴다.

```tsx
import { GlobalImageLightbox } from "@junds/ui/composites";

// 레이아웃에 한 번만
<GlobalImageLightbox rootSelector=".article__body" minSize={80} />
```

- `rootSelector` 를 주지 않으면 문서 전체가 대상이라 헤더 로고·아바타까지 잡힌다.
- `minSize` 미만은 무시 — 원본 크기와 렌더 크기를 **둘 다** 보므로 CSS 로 줄여 둔 큰
  이미지도 걸러진다. 아이콘이 잡히면 값을 올린다.
- 특정 이미지만 빼려면 `exclude=".no-zoom"`.

이미지를 React 로 감쌀 수 있는 자리(포토 그리드 등)에서는 개별형 `ImageLightbox` 가 낫다.

---

[← 01 설치](01-setup.md) · [다음: 03 블로그 →](03-blog.md)
