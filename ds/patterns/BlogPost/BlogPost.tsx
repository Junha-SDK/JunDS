"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface BlogAuthor {
  name: string;
  avatar?: string;
  bio?: string;
  href?: string;
}

export interface BlogPostProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 제목 */
  title: ReactNode;
  /** 부제 / 요약 */
  excerpt?: ReactNode;
  /** 발행일 */
  publishedAt?: Date | string;
  /** 읽기 시간(분) */
  readingMinutes?: number;
  /** 작성자 */
  author?: BlogAuthor;
  /** 카테고리/태그 */
  tags?: string[];
  /** 커버 이미지 URL */
  coverImage?: string;
  /** 본문 (children) */
  children: ReactNode;
  /** 우측 사이드바 (TOC 등) */
  sidebar?: ReactNode;
  /** 하단 영역 (관련 글, 공유 등) */
  footer?: ReactNode;
}

function fmtDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * 블로그/아티클 페이지 표준 레이아웃 (cover + meta + body + sidebar + footer).
 * @example
 * <BlogPost title="제목" author={{name:"홍길동"}} publishedAt="2026-04-30">본문</BlogPost>
 * @status stable
 * @since 2.3.0
 * @tags layout
 */
export const BlogPost = forwardRef<HTMLElement, BlogPostProps>(function BlogPost(
  { title, excerpt, publishedAt, readingMinutes, author, tags, coverImage, children, sidebar, footer, className, ...props },
  ref,
) {
  return (
    <article
      ref={ref}
      className={cn("max-w-6xl mx-auto px-4 sm:px-6 py-10", className)}
      {...props}
    >
      <header className="max-w-3xl mx-auto text-center mb-8">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mb-4">
            {tags.map((t) => (
              <span key={t} className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-soft text-primary">{t}</span>
            ))}
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">{title}</h1>
        {excerpt && <p className="mt-4 text-lg text-muted">{excerpt}</p>}
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted">
          {author && (
            <span className="flex items-center gap-2">
              {author.avatar && <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full" />}
              {author.href ? <a href={author.href} className="hover:text-foreground">{author.name}</a> : author.name}
            </span>
          )}
          {publishedAt && (
            <>
              <span>·</span>
              <time>{fmtDate(publishedAt)}</time>
            </>
          )}
          {readingMinutes !== undefined && (
            <>
              <span>·</span>
              <span>{readingMinutes}분 읽기</span>
            </>
          )}
        </div>
      </header>

      {coverImage && (
        <div className="max-w-5xl mx-auto mb-10 rounded-xl overflow-hidden">
          <img src={coverImage} alt="" className="w-full h-auto object-cover" />
        </div>
      )}

      <div className={cn("grid gap-10", sidebar ? "lg:grid-cols-[1fr_240px]" : "max-w-3xl mx-auto")}>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {children}
        </div>
        {sidebar && (
          <aside className="hidden lg:block">
            <div className="sticky top-6">{sidebar}</div>
          </aside>
        )}
      </div>

      {footer && (
        <footer className="max-w-3xl mx-auto mt-16 pt-8 border-t border-border">
          {footer}
        </footer>
      )}
    </article>
  );
});
