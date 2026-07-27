# MySelf → JunDS 사용법 (USAGE)

`MySelf`(junome.info)의 모든 화면을 **JunDS 위에서 짓는 방법**. 코드는 전부 실제
public 표면(`ds/*/index.ts` 배럴 export)과 1:1 대응한다 — 존재하지 않는 prop 은 쓰지 않았다.

- 무엇이 왜 옮겨졌는지(대응표·판단 근거)는 [`requirements/myself-migration.md`](requirements/myself-migration.md).
- 컴포넌트 하나의 prop 전체 명세는 [`.ai/props.json`](.ai/props.json) / [`COMPONENTS.md`](COMPONENTS.md).
- 일반적인 조합 레시피는 [`.ai/recipes/`](.ai/recipes/README.md).

## 목차

| 문서 | 범위 |
|---|---|
| [USAGE-MYSELF/01-setup.md](USAGE-MYSELF/01-setup.md) | 설치 · 프로바이더 배치 · 토큰/폰트 · 라우터 어댑터 |
| [USAGE-MYSELF/02-shell-seo.md](USAGE-MYSELF/02-shell-seo.md) | 앱 셸 · 헤더/푸터 · 테마 토글 · SEO · JSON-LD · 검색 팔레트 |
| [USAGE-MYSELF/03-blog.md](USAGE-MYSELF/03-blog.md) | 블로그 목록 · 글 본문 · 목차 · 메타 · 연관 글 · 코드 복사 |
| [USAGE-MYSELF/04-docs.md](USAGE-MYSELF/04-docs.md) | 독스 좌측 트리 · 문서 히어로 · 외부 링크 · 스크린샷 · 이전/다음 |
| [USAGE-MYSELF/05-daily.md](USAGE-MYSELF/05-daily.md) | 데일리 아카이브 · 필터 · 카테고리 색 · 커버 이미지 · 통계 · 아트 모드 |
| [USAGE-MYSELF/06-book.md](USAGE-MYSELF/06-book.md) | 서재 목록 · 표지 · 리더 · 챕터 · 스포일러 · 금칙처리 |
| [USAGE-MYSELF/07-portfolio-music.md](USAGE-MYSELF/07-portfolio-music.md) | 포트폴리오 인덱스 · 케이스 · 등장 모션 · 음악 플레이어 · 가사 |
| [USAGE-MYSELF/08-hooks-tokens.md](USAGE-MYSELF/08-hooks-tokens.md) | 훅 23종 · 토큰 전체 · 유틸 레퍼런스 |

## 이 저장소의 다른 트랙과의 관계

| 트랙 | 위치 | MySelf 와의 관계 |
|---|---|---|
| **React 라이브러리** (`@junds/ui`) | `ds/` | **MySelf 가 쓰는 것.** 이 문서의 전부 |
| 바닐라 커스텀 엘리먼트 | `packages/web` | 안 씀 — MySelf 는 React 앱이다 |
| iOS (SwiftUI·UIKit) | `packages/ios` · [USAGE](packages/ios/USAGE.md) | 안 씀. MySelf 가 앱을 내면 그때 |
| finance 도메인 | `ds/finance` | 안 씀 — 주식/시세는 MySelf 의 도메인이 아니다 |

> iOS·finance 는 같은 원장(`docs-spec/registry/ledger.json` 468행)을 공유하지만 표면이
> 다르다. MySelf 는 `@junds/ui` 의 `.`·`./composites`·`./hooks`·`./providers`·`./tokens`·
> `./layout`·`./utils` 서브패스만 쓴다.

## 공통 규약

- **불러오기.** 루트(`@junds/ui`)에서 전부 꺼낼 수 있고, 서브패스로 좁히면 번들이 얇아진다.
  ```tsx
  import { Callout, TableOfContents } from "@junds/ui/composites";
  import { useSeo, useCodeCopy } from "@junds/ui/hooks";
  ```
- **스타일은 한 번만.** `@junds/ui/styles.css` 를 앱 진입점에서 한 번 import 한다.
  이걸 빼면 모든 컴포넌트가 스타일 없이 렌더된다.
- **라우터 비종속.** 링크를 그리는 컴포넌트(`DocPager`·`ProjectCard`·`RelatedPosts`)는
  `renderLink` 로 라우터를 주입받는다. 안 주면 평범한 `<a>` — 클라이언트 라우팅이 끊긴다.
  MySelf 는 react-router 를 쓰므로 [01-setup §4](USAGE-MYSELF/01-setup.md) 의 어댑터를 한 번
  만들어 재사용한다.
- **새 동작은 전부 opt-in.** MySelf 에서 옮겨 온 기능(엣지 peek·재시도·소생·금칙처리)은
  기본이 꺼져 있다. 기존 JunDS 사용처를 깨지 않기 위해서다 — MySelf 에서는 **켜야 한다.**
  각 절에 "MySelf 는 이렇게 켠다"를 표시했다.
- **한국어 기본.** 컴포넌트 내장 문자열이 한국어다. 바꾸려면 `I18nProvider` 로 부분 override.
- **SSG 안전.** MySelf 는 puppeteer 프리렌더를 쓴다. 이 문서의 컴포넌트는 render 단계에서
  `Math.random()`·`Date.now()` 를 쓰지 않는다(`Waveform`·`AlbumArt` 는 시드 해시 기반).
  다만 **`useDominantColor`·`GlobeWireframe`·`Starfield` 는 캔버스를 쓰므로 프리렌더 시점에는
  폴백 값이 나온다** — 첫 페인트가 중요한 자리에는 두지 않는다.

## 아직 JunDS 에 없는 것 (MySelf 에 남는다)

이식 대상이 아니라고 판단한 것들이다. 자세한 근거는 요구사항 문서의 Open questions 참조.

| MySelf 자산 | 왜 남는가 |
|---|---|
| `SeoResolver` (라우트→제목 매핑) | 사이트의 정보 구조지 디자인 시스템이 아니다 |
| `blog.registry` / `docs.registry` / `daily` 데이터 | 콘텐츠 파이프라인 |
| `md2tsx` · 프리렌더 · 사이트맵 스크립트 | 빌드 도구 |
| `OriginalsGate` (문제은행 + Argon2id) | MySelf 의 인증 구현에 묶여 있다 |
| `parseSpoilerSegments` (`<스포일러>` 토큰 파서) | 콘텐츠 저작 규약 |
| `DailyArchive`·`DocsArtIndex`·`BookDetail` 등 화면 | 도메인 집계 — 재료는 뽑았고 조립은 앱 몫 |
