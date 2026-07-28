"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export type LinkVariant = "default" | "subtle" | "muted" | "danger";
export type LinkUnderline = "always" | "hover" | "none";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** 색상 변형 */
  variant?: LinkVariant;
  /** 밑줄 스타일 */
  underline?: LinkUnderline;
  /** 외부 링크 (target=_blank + rel + 아이콘) */
  external?: boolean;
  /** 링크 컨텐츠 */
  children?: ReactNode;
}

const variantClass: Record<LinkVariant, string> = {
  default: "text-primary-ink hover:text-primary-hover",
  subtle: "text-foreground hover:text-primary-ink",
  muted: "text-muted hover:text-foreground",
  danger: "text-danger hover:opacity-80",
};

const underlineClass: Record<LinkUnderline, string> = {
  always: "underline underline-offset-2",
  hover: "no-underline hover:underline underline-offset-2",
  none: "no-underline",
};

/**
 * 라우터-aware 앵커 프리미티브. 외부/내부 링크를 한 컴포넌트로 표현.
 * @example
 * <Link href="/docs" underline="hover">문서 보기</Link>
 * <Link href="https://example.com" external>외부</Link>
 * @status stable
 * @since 2.3.0
 * @tags navigation
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    variant = "default",
    underline = "hover",
    external,
    className,
    children,
    target,
    rel,
    ...props
  },
  ref,
) {
  const isExternal = external ?? /^https?:\/\//.test(props.href ?? "");
  const finalTarget = target ?? (isExternal ? "_blank" : undefined);
  const finalRel = rel ?? (isExternal ? "noopener noreferrer" : undefined);

  return (
    <a
      ref={ref}
      target={finalTarget}
      rel={finalRel}
      className={cn(
        "inline-flex items-center gap-1 transition-colors cursor-pointer rounded-sm",
        // ring-ring 은 이 라이브러리에 없는 토큰이라 포커스 링이 사실상 색을 잃고 있었다
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:opacity-80",
        variantClass[variant],
        underlineClass[underline],
        className,
      )}
      {...props}
    >
      {children}
      {isExternal && (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 3h6v6M9 3L3 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </a>
  );
});
