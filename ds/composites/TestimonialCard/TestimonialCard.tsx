"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type TestimonialVariant = "card" | "quote" | "minimal";

export interface TestimonialCardProps extends HTMLAttributes<HTMLDivElement> {
  /** 변형 */
  variant?: TestimonialVariant;
  /** 후기 본문 */
  quote: ReactNode;
  /** 평점 (1~5) */
  rating?: number;
  /** 작성자 이름 */
  authorName: string;
  /** 작성자 직책/회사 */
  authorRole?: string;
  /** 작성자 아바타 URL */
  authorAvatar?: string;
  /** 작성자 회사 로고 */
  companyLogo?: ReactNode;
  /** 강조 표시 */
  highlighted?: boolean;
}

/**
 * 사용자 후기 카드 (랜딩 / 마케팅 페이지).
 * @example
 * <TestimonialCard quote="정말 빠릅니다" rating={5} authorName="홍길동" authorRole="CTO @ Acme" />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const TestimonialCard = forwardRef<HTMLDivElement, TestimonialCardProps>(
  function TestimonialCard(
    {
      variant = "card",
      quote,
      rating,
      authorName,
      authorRole,
      authorAvatar,
      companyLogo,
      highlighted,
      className,
      ...props
    },
    ref,
  ) {
    const initials = authorName
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const stars = rating !== undefined && (
      // 별 금색은 평점의 정체성 색이라 유지하되, 리터럴 hex 대신 currentColor 로 흘려
      // className 하나로 덮어쓸 수 있게 한다.
      <div className="flex items-center gap-0.5 mb-2 text-amber-500" aria-label={`${rating}점`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill={i <= rating ? "currentColor" : "transparent"}
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M8 1l2.2 4.5 5 .7-3.6 3.5.85 5L8 12.3 3.55 14.7l.85-5L.8 6.2l5-.7z"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
    );

    const author = (
      <div className="flex items-center gap-3 mt-4">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{authorName}</div>
          {authorRole && <div className="text-xs text-muted truncate">{authorRole}</div>}
        </div>
        {companyLogo && <div className="shrink-0 opacity-60">{companyLogo}</div>}
      </div>
    );

    if (variant === "quote") {
      return (
        <div ref={ref} className={cn("relative px-6 py-8", className)} {...props}>
          <span
            className="absolute top-2 left-0 text-6xl text-primary-ink/20 font-serif leading-none select-none"
            aria-hidden="true"
          >
            "
          </span>
          {stars}
          <blockquote className="text-lg italic leading-relaxed">{quote}</blockquote>
          {author}
        </div>
      );
    }

    if (variant === "minimal") {
      return (
        <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props}>
          {stars}
          <p className="text-sm text-foreground leading-relaxed">{quote}</p>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium text-foreground">{authorName}</span>
            {authorRole && <span>· {authorRole}</span>}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-surface p-5 transition-shadow duration-200 ease-out",
          // 면이 있는 카드는 상단 인셋 하이라이트로 두께를 만든다.
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.12)]",
          highlighted
            ? "border-primary ring-1 ring-primary/30 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.3),0_2px_6px_-3px_rgba(0,0,0,0.16)]"
            : "border-border hover:shadow-[0_8px_24px_-10px_rgba(0,0,0,0.3),0_2px_6px_-3px_rgba(0,0,0,0.16)]",
          className,
        )}
        {...props}
      >
        {stars}
        <blockquote className="text-sm text-foreground leading-relaxed">{quote}</blockquote>
        {author}
      </div>
    );
  },
);
