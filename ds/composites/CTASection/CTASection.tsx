"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type CTAVariant = "default" | "gradient" | "subtle" | "split";

export interface CTAButton {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface CTASectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 변형 */
  variant?: CTAVariant;
  /** 메인 제목 */
  title: ReactNode;
  /** 부제 */
  description?: ReactNode;
  /** Primary CTA */
  primaryCta?: CTAButton;
  /** Secondary CTA */
  secondaryCta?: CTAButton;
  /** 우측 미디어 (split 전용) */
  media?: ReactNode;
}

function Button({ cta, primary, dark }: { cta: CTAButton; primary: boolean; dark: boolean }) {
  const className = cn(
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer",
    "transition-[background-color,border-color,transform] duration-150 active:scale-[0.98]",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
    // `ring-ring` 은 이 저장소에 없는 토큰이라 포커스 링이 아예 그려지지 않았다.
    // 어두운 CTA 위에서는 primary 링이 묻히므로 배경에 따라 링 색을 바꾼다
    dark
      ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    primary
      ? dark
        ? "bg-white text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(0,0,0,0.12)] hover:bg-white/90"
        : "bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.12)] hover:bg-primary-hover"
      : dark
      ? "border border-white/40 text-white hover:bg-white/10 active:bg-white/20"
      : "border border-border bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] hover:bg-surface-soft hover:border-primary/40",
  );
  if (cta.href)
    return (
      <a href={cta.href} className={className}>
        {cta.label}
      </a>
    );
  return (
    <button type="button" onClick={cta.onClick} className={className}>
      {cta.label}
    </button>
  );
}

/**
 * 강조형 CTA 섹션 (랜딩 페이지 하단 행동 유도).
 * @example
 * <CTASection variant="gradient" title="지금 시작하세요" primaryCta={{label:"무료 가입"}} />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const CTASection = forwardRef<HTMLElement, CTASectionProps>(function CTASection(
  { variant = "default", title, description, primaryCta, secondaryCta, media, className, ...props },
  ref,
) {
  const isDark = variant === "gradient";

  if (variant === "split") {
    return (
      <section
        ref={ref}
        className={cn("max-w-6xl mx-auto px-4 sm:px-6 py-12", className)}
        {...props}
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center rounded-2xl border border-border bg-surface p-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
            {description && <p className="mt-3 text-base text-muted">{description}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              {primaryCta && <Button cta={primaryCta} primary dark={false} />}
              {secondaryCta && <Button cta={secondaryCta} primary={false} dark={false} />}
            </div>
          </div>
          {media && <div>{media}</div>}
        </div>
      </section>
    );
  }

  const wrapperClass = cn(
    "px-4 sm:px-6 py-12 sm:py-16",
    variant === "gradient" && "bg-gradient-to-br from-primary to-primary-hover text-white",
    variant === "subtle" && "bg-surface-soft",
    variant === "default" && "bg-surface border-y border-border",
  );

  return (
    <section ref={ref} className={cn(wrapperClass, className)} {...props}>
      <div className="max-w-3xl mx-auto text-center">
        <h2
          className={cn(
            "text-2xl sm:text-3xl font-bold tracking-tight",
            isDark ? "text-white" : "",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-3 text-base", isDark ? "text-white/85" : "text-muted")}>
            {description}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {primaryCta && <Button cta={primaryCta} primary dark={isDark} />}
            {secondaryCta && <Button cta={secondaryCta} primary={false} dark={isDark} />}
          </div>
        )}
      </div>
    </section>
  );
});
