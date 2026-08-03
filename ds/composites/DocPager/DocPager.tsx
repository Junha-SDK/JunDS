"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface DocPagerEntry {
  /** 이동할 URL */
  href: string;
  /** 문서 제목 */
  title: string;
  /** 제목 위 작은 설명 (섹션명 등) */
  description?: string;
}

export interface DocPagerProps extends HTMLAttributes<HTMLElement> {
  /** 이전 문서 (없으면 자리만 비워 다음 문서가 오른쪽에 남는다) */
  prev?: DocPagerEntry | null;
  /** 다음 문서 */
  next?: DocPagerEntry | null;
  /** 이전 쪽 라벨 (기본 `"이전 문서"`) */
  prevLabel?: string;
  /** 다음 쪽 라벨 (기본 `"다음 문서"`) */
  nextLabel?: string;
  /** nav 의 접근성 라벨 */
  ariaLabel?: string;
  /**
   * 링크 렌더러. Next.js `<Link>` 나 react-router `<Link>` 를 쓰려면 넘긴다.
   * 기본은 평범한 `<a>` — 클라이언트 라우팅 없이 전체 페이지가 다시 뜬다.
   */
  renderLink?: (props: { href: string; className: string; children: ReactNode }) => ReactNode;
}

// 살짝 떠오르는 것으로 "여기를 누르면 넘어간다" 를 말한다 — 부상은 움직임이라 감속 요청을 받는다
const linkClass =
  "group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 no-underline" +
  " shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]" +
  " transition-[color,background-color,border-color,box-shadow,transform] duration-150" +
  " hover:border-primary hover:bg-card-hover hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)]" +
  " active:translate-y-0" +
  " motion-reduce:transition-none motion-reduce:hover:translate-y-0" +
  " focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

/**
 * 문서 하단의 이전/다음 문서 내비게이션.
 *
 * 번호로 페이지를 넘기는 `Pagination` 과 달리, 순서가 정해진 문서 묶음을 앞뒤로
 * 오갈 때 쓴다. 한쪽만 있으면 나머지 자리는 비워 두어 "다음" 링크가 항상 오른쪽에
 * 오도록 한다 — 위치가 방향을 알려주는 단서이기 때문이다.
 *
 * @example
 * <DocPager prev={prevDoc} next={nextDoc} />
 * @example
 * // Next.js 라우터와 함께
 * <DocPager next={next} renderLink={({ href, className, children }) => (
 *   <Link href={href} className={className}>{children}</Link>
 * )} />
 * @status stable
 * @since 2.3.0
 * @tags navigation, content
 */
export const DocPager = forwardRef<HTMLElement, DocPagerProps>(function DocPager(
  {
    prev,
    next,
    prevLabel = "이전 문서",
    nextLabel = "다음 문서",
    ariaLabel = "문서 이동",
    renderLink,
    className,
    ...props
  },
  ref,
) {
  if (!prev && !next) return null;

  const renderEntry = (entry: DocPagerEntry, label: string, isNext: boolean) => {
    const content = (
      <>
        <span
          className={cn(
            "flex items-center gap-1 text-2xs uppercase tracking-wider text-muted",
            isNext && "justify-end",
          )}
        >
          {!isNext && <span aria-hidden="true">←</span>}
          {label}
          {isNext && <span aria-hidden="true">→</span>}
        </span>
        <strong
          className={cn(
            "text-sm font-medium text-foreground transition-colors group-hover:text-primary-ink",
            isNext && "text-right",
          )}
        >
          {entry.title}
        </strong>
        {entry.description && (
          <span className={cn("text-xs text-muted", isNext && "text-right")}>
            {entry.description}
          </span>
        )}
      </>
    );

    if (renderLink) {
      return renderLink({ href: entry.href, className: linkClass, children: content });
    }
    return (
      <a href={entry.href} className={linkClass}>
        {content}
      </a>
    );
  };

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}
      {...props}
    >
      {prev ? renderEntry(prev, prevLabel, false) : <div />}
      {next ? renderEntry(next, nextLabel, true) : <div />}
    </nav>
  );
});
