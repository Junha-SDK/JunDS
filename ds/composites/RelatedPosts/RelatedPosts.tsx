"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface RelatedPost {
  /** 고유 키 */
  id: string;
  /** 글 제목 */
  title: string;
  /** 이동할 URL (없으면 `id` 를 그대로 쓴다) */
  href?: string;
  /** 카테고리·태그 등 제목 아래 보조 라벨 */
  category?: string;
}

export interface RelatedPostsProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 보여줄 글 목록 */
  posts: RelatedPost[];
  /** 섹션 제목 (기본 `"연관 글 읽기"`) */
  title?: string;
  /** 최대 노출 개수 (기본 4) */
  max?: number;
  /** 한 줄에 놓을 카드 수 (기본 2) */
  columns?: 1 | 2 | 3;
  /**
   * 링크 렌더러. Next.js `<Link>` 나 react-router `<Link>` 를 쓰려면 넘긴다.
   * 기본은 평범한 `<a>`.
   */
  renderLink?: (props: {
    href: string;
    className: string;
    children: ReactNode;
  }) => ReactNode;
}

const colsMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
} as const;

const cardClass =
  "group flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 no-underline transition-colors hover:border-primary hover:bg-card-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

/**
 * 글 하단의 연관 글 목록.
 *
 * 어떤 글이 연관인지 고르는 일은 콘텐츠의 몫이라 이 컴포넌트가 하지 않는다 —
 * 이미 고른 목록을 받아 그리기만 한다. 목록이 비면 섹션 자체가 사라지므로,
 * 연관 글이 없는 글에 "연관 글 읽기"라는 빈 제목만 남지 않는다.
 *
 * @example
 * <RelatedPosts posts={related} />
 * @status stable
 * @since 2.3.0
 * @tags content, navigation
 */
export const RelatedPosts = forwardRef<HTMLElement, RelatedPostsProps>(
  function RelatedPosts(
    { posts, title = "연관 글 읽기", max = 4, columns = 2, renderLink, className, ...props },
    ref,
  ) {
    const visible = posts.slice(0, max);
    if (visible.length === 0) return null;

    return (
      <section
        ref={ref}
        aria-label={title}
        className={cn("flex flex-col gap-3", className)}
        {...props}
      >
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <div className={cn("grid gap-2", colsMap[columns])}>
          {visible.map((post) => {
            const href = post.href ?? post.id;
            const body = (
              <>
                <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </span>
                {post.category && (
                  <span className="text-xs text-muted">{post.category}</span>
                )}
              </>
            );

            if (renderLink) {
              return (
                <span key={post.id} className="contents">
                  {renderLink({ href, className: cardClass, children: body })}
                </span>
              );
            }
            return (
              <a key={post.id} href={href} className={cardClass}>
                {body}
              </a>
            );
          })}
        </div>
      </section>
    );
  },
);
