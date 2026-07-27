# 01. 설치 · 프로바이더 · 토큰 · 라우터 어댑터

[← 목차](../USAGE-MYSELF.md)

## 1. 설치

MySelf 는 이미 `scripts/sync-junds-v3.mjs` 로 `public/junds-v3/` 를 동기화하고 있다.
라이브러리 자체는 npm 으로 받는다.

```bash
npm i @junds/ui
```

`@junds/ui` 의 peer 는 React 19 하나뿐이다(MySelf 는 이미 19.1.1). 런타임 의존성은
각각 파일 하나에만 격리돼 있어서, 안 쓰는 컴포넌트는 트리셰이킹으로 빠진다.

## 2. 스타일 — 한 번만 import

```ts
// src/main.tsx — 다른 CSS보다 먼저
import "@junds/ui/styles.css";
import "./styles/index.css";
```

이 파일 하나가 다음을 전부 싣는다.

| 블록 | 내용 |
|---|---|
| 폰트 스택 | `--font-sans` / `-serif` / `-display` / `-hand` / `-mono` |
| 카테고리 액센트 | `--cat-movie` / `-daily` / `-comic` / `-retrospect` / `-book` / `-musical` / `-anime` / `-neutral` (각 4슬롯) |
| 테마 토큰 | `--background` `--foreground` `--card` `--border` `--primary` `--muted` … + `[data-theme="dark"]` 재도색 |
| 런타임 노브 | `--jds-radius-*` · `--jds-density-*` · `--jds-font-scale` |
| 컴포넌트 CSS | `.jds-code-copy-btn` · `.jds-reveal` · `.jds-waveform-head` + `@keyframes` |
| Tailwind v4 등록 | `@theme inline` — `text-foreground`·`bg-card`·`border-border`·`text-2xs` 유틸리티 |

> **MySelf 의 `styles/tokens.css` 와 겹친다.** 두 파일은 같은 변수 이름(`--font-sans`,
> `--cat-*`)을 쓰므로 **나중에 import 된 쪽이 이긴다.** 교체 순서는
> ① `@junds/ui/styles.css` 만 남기고 MySelf 의 tokens.css 에서 폰트·카테고리 블록을 지운다
> ② 남은 MySelf 고유 변수(`--pf-writer-paper` 등)만 tokens.css 에 유지 — 이게 안전하다.
> 두 파일을 그대로 두면 값이 같아 당장은 문제없지만, JunDS 쪽 튜닝이 반영되지 않는다.

## 3. 프로바이더 배치

순서가 중요하다. 바깥부터 안쪽으로 **테마 → SEO → 토스트 → 라우터**.

```tsx
// src/main.tsx
import { ThemeProvider, SeoProvider } from "@junds/ui/providers";
import { DsToastProvider } from "@junds/ui/composites";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultColorMode="dark">
    <SeoProvider
      defaults={{
        title: "junome",
        titleTemplate: "%s | junome",
        description: "junha의 개발 블로그 & 포트폴리오",
        siteUrl: "https://www.junome.info",
        siteName: "junome",
        ogImage: "https://www.junome.info/og/home-v3.png",
        favicon: "https://www.junome.info/api/identicon?seed=%2Fhome",
        locale: "ko_KR",
      }}
    >
      <DsToastProvider position="bottom-right" maxToasts={4}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DsToastProvider>
    </SeoProvider>
  </ThemeProvider>,
);
```

### 왜 이 순서인가

- **`ThemeProvider` 가 가장 바깥** — `data-theme` 를 `<html>` 에 쓰므로 나머지 전부가
  그 아래에서 색을 읽는다. MySelf 는 다크 고정이라 `defaultColorMode="dark"`.
  (`"system"` 으로 두면 OS 설정을 따라간다.)
- **`SeoProvider` 는 라우터보다 바깥** — 페이지가 지정하지 않은 필드를 채우는 기본값이라,
  라우트가 바뀌어도 살아 있어야 한다. 페이지를 떠날 때 되돌릴 "원래 상태"도 이 값이다.
- **`DsToastProvider` 는 라우터 안이어도 되지만 바깥이 낫다** — 라우트 전환 중에 뜬 토스트가
  전환과 함께 사라지지 않는다.

### `useTheme` 로 읽기

```tsx
import { useTheme } from "@junds/ui/providers";

const { isDark, colorMode, setColorMode } = useTheme();
```

`colorMode` 는 `"light" | "dark" | "system"`, `isDark` 는 system 을 해석한 결과다.
테마 토글 UI 는 [02-shell-seo §3](02-shell-seo.md) 참조.

## 4. 라우터 어댑터 — 한 번 만들고 재사용

`DocPager`·`ProjectCard`·`RelatedPosts` 는 `renderLink` 로 라우터를 받는다. 매번 인라인으로
쓰면 세 군데에 같은 코드가 생기니 한 번만 만든다.

> **이름 충돌 주의.** JunDS 도 `Link` 프리미티브를 export 한다(`@junds/ui/primitives`).
> 아래 `Link` 는 **react-router 의 것**이다. 한 파일에서 둘 다 쓸 일이 있으면
> `import { Link as JdLink } from "@junds/ui/primitives"` 로 별칭을 준다.

```tsx
// src/core/ui/junds-link.tsx
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

/** JunDS 의 renderLink 규약을 react-router <Link> 로 잇는다 */
export const routerLink = ({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) => (
  <Link to={href} className={className}>
    {children}
  </Link>
);
```

```tsx
<DocPager prev={prev} next={next} renderLink={routerLink} />
<RelatedPosts posts={related} renderLink={routerLink} />
<ProjectCard title="JunDS" href="/docs/junds" renderLink={routerLink} />
```

> **`renderLink` 를 빼먹으면 전체 새로고침이 난다.** 화면은 멀쩡해 보이므로 리뷰에서 놓치기
> 쉽다 — 링크를 그리는 JunDS 컴포넌트를 새로 쓸 때마다 `renderLink` 를 확인한다.

## 5. 프리렌더(SSG) 주의

MySelf 는 puppeteer 로 초기 HTML 을 굳힌다. `src/test/guardrails/ssg-determinism.test.tsx` 가
더블 렌더 비교로 결정성을 강제하므로, 다음을 지킨다.

| 안전 | 이유 |
|---|---|
| `Waveform` · `AlbumArt` | 시드 해시 기반 — 같은 입력이면 언제나 같은 출력 |
| `Lyrics` · `BarList` · `DocHero` · `RelatedPosts` | 순수 렌더 |
| `TableOfContents` | 수집이 effect 안 — 첫 렌더는 빈 목차로 결정적 |

| 주의 | 이유 |
|---|---|
| `useDominantColor` | 캔버스 디코드가 effect — 프리렌더 HTML 에는 폴백색이 굳는다 |
| `GlobeWireframe` · `Starfield` | 캔버스 — 프리렌더에는 빈 캔버스 |
| `useSeo` | effect 에서 `<head>` 를 고친다. 프리렌더 산출물의 메타는 `index.html` + 프리렌더러가 책임 |

캔버스 컴포넌트를 above-the-fold 에 두면 첫 화면이 잠깐 빈다. `Starfield`·`GlobeWireframe`
은 배경이라 문제없지만, `useDominantColor` 로 물들인 히어로를 첫 화면에 놓으면 색이 한 번
바뀌는 게 보인다 — 그 자리에는 `ready` 를 보고 전환을 억제한다.

```tsx
const { tint, deep, ready } = useDominantColor(cover, seed);

<div
  style={{ background: `linear-gradient(${tint}, ${deep})` }}
  // 추출 전에는 전환을 끈다 — 폴백색에서 실제색으로 튀는 게 보이지 않게
  className={ready ? "transition-[background] duration-700" : undefined}
/>
```

## 6. 교체 순서 제안

한 번에 다 바꾸지 않는다. 의존이 적은 것부터.

1. **토큰·스타일** — `styles.css` import + tokens.css 정리 (시각 변화 0 을 확인)
2. **훅** — `useFocusMode`·`useScrollSpy`·`useCodeCopy`·`useSeo` (화면 구조 안 건드림)
3. **잎 컴포넌트** — `Callout`·`SpoilerBlock`·`Tag`·`Badge`·`Skeleton`
4. **콘텐츠 컴포넌트** — `TableOfContents`·`ReadingTime`·`RelatedPosts`·`DocPager`
5. **화면 셸** — `AppShell`·`TreeNav`·`CommandPalette`
6. **도메인 화면** — 서재·데일리·음악 (여기서부터는 조립 코드를 새로 쓴다)

각 단계 후 `npm run typecheck && npm run lint && npm run test:run` 을 돌린다 — MySelf 의
가드레일 테스트(CJK 볼드·CSS 스코프·SSG 결정성)가 회귀를 잡아 준다.

---

[← 목차](../USAGE-MYSELF.md) · [다음: 02 셸·SEO →](02-shell-seo.md)
