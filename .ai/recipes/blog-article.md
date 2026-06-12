# Recipe — Blog Article with TOC + Progress

## Goal

긴 블로그 글의 가독성과 탐색성을 동시에 챙긴다 — 진행률 표시, 자동 목차,
인용/하이라이트, 마지막 구독 폼.

## Used components

- `BlogPost` — `@/ds/patterns/BlogPost` (메타 + 본문 컨테이너)
- `TableOfContents` — `@/ds/composites/TableOfContents` (자동 헤딩 추출)
- `ScrollProgress` — `@/ds/composites/ScrollProgress`
- `Blockquote` — `@/ds/composites/Blockquote`
- `Newsletter` — `@/ds/composites/Newsletter`

## Recipe

```tsx
"use client";
import { BlogPost } from "@/ds/patterns/BlogPost";
import { TableOfContents } from "@/ds/composites/TableOfContents";
import { ScrollProgress } from "@/ds/composites/ScrollProgress";
import { Blockquote } from "@/ds/composites/Blockquote";
import { Newsletter } from "@/ds/composites/Newsletter";

export default function ArticlePage() {
  return (
    <>
      <ScrollProgress position="top" thickness={3} aria-label="글 읽기 진행률" />

      <div className="grid lg:grid-cols-[1fr_280px] gap-10 max-w-6xl mx-auto px-4 py-10">
        <BlogPost
          title="JunDS 2.3 — 가장자리부터 단단해지기"
          excerpt="번들 게이트, a11y strict, motion/RTL 스캐너까지 — CI에서 회귀를 막는 방법."
          publishedAt="2026-04-30"
          readingMinutes={8}
          author={{ name: "준하", avatar: "/avatars/junha.png", role: "DS Lead" }}
          tags={["release", "ci", "a11y"]}
          coverImage="/blog/cover-2-3.jpg"
        >
          <h2 id="why-gates">왜 게이트인가</h2>
          <p>설치 5분짜리 라이브러리도 6개월 후엔 조용히 무너진다…</p>

          <Blockquote variant="quote" cite="2026 Annual DS Survey">
            팀의 73%가 디자인 시스템을 "사용 중"이라 답했지만, 같은 비율이 회귀
            방지 게이트를 가지고 있지 않았다.
          </Blockquote>

          <h2 id="bundle-gate">번들 예산 게이트</h2>
          <p>각 컴포넌트는 kind별 ceiling을 가지며…</p>

          <h2 id="a11y-strict">a11y strict</h2>
          <p>22 → 0 critical을 지속하기 위한 CI 잡…</p>

          <Blockquote variant="warning">
            strict 모드는 점진적으로 켜라. 0 위반을 만든 PR과 strict CI를 도입한
            PR은 분리해야 회귀 디버깅이 쉽다.
          </Blockquote>

          <h2 id="motion-rtl">motion/RTL 스캐너</h2>
          <p>transition을 쓰면서 motion-reduce 짝을 안 단 컴포넌트를…</p>
        </BlogPost>

        <aside className="hidden lg:block sticky top-24 self-start">
          <TableOfContents
            selector="article h2, article h3"
            activeTracking
            smooth
            title="목차"
          />
        </aside>
      </div>

      <Newsletter
        title="다음 글이 올라오면 알려드릴까요?"
        description="릴리스/디프 위주, 마케팅 0%."
        submitLabel="구독"
        onSubmit={async (email) => {
          await fetch("/api/newsletter", {
            method: "POST",
            body: JSON.stringify({ email, source: "blog-article" }),
          });
        }}
      />
    </>
  );
}
```

## Variations

- **TOC 없는 짧은 글**: `<aside>` 통째로 제거 + grid → 단일 컬럼
- **시리즈 글**: `BlogPost`의 `tags` 자리 위에 시리즈 네비게이션 추가
- **다크 톤 블록인용**: `<Blockquote variant="dark">`

## See also

- `app/design-system/patterns/blog-post/page.tsx`
- `.ai/recipes/marketing-landing.md` — Newsletter 변형
