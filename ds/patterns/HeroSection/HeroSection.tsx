"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type HeroVariant = "centered" | "split" | "imageBg" | "minimal";

export interface HeroSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 변형 */
  variant?: HeroVariant;
  /** 상단 eyebrow 텍스트/배지 */
  eyebrow?: ReactNode;
  /** 메인 제목 */
  title: ReactNode;
  /** 부제 */
  subtitle?: ReactNode;
  /** Primary CTA */
  primaryCta?: { label: string; href?: string; onClick?: () => void };
  /** Secondary CTA */
  secondaryCta?: { label: string; href?: string; onClick?: () => void };
  /** 우측 미디어 (split 전용) */
  media?: ReactNode;
  /** 배경 이미지 URL (imageBg 전용) */
  bgImage?: string;
  /** 푸터 영역 (소셜 프루프, 로고 등) */
  footer?: ReactNode;
}

function CtaButton({
  cta,
  primary,
}: {
  cta: NonNullable<HeroSectionProps["primaryCta"]>;
  primary: boolean;
}) {
  const className = cn(
    "inline-flex items-center justify-center rounded-xl font-semibold px-5 py-2.5 text-sm cursor-pointer whitespace-nowrap",
    "transition-[background-color,box-shadow,transform] duration-150",
    "active:scale-[0.97] motion-reduce:active:scale-100",
    // ring-ring 은 --color-ring 이 이 저장소에 없어서 클래스 자체가 생성되지 않는다.
    // outline 만 지워진 채 링이 안 나오던 자리 — 실재하는 primary 토큰으로 되돌린다
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    primary
      ? "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_8px_-2px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.18)]"
      : "border border-border bg-surface hover:bg-surface-soft text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.12)]",
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
 * 마케팅 / 랜딩 페이지 hero 섹션 (centered/split/imageBg/minimal).
 * @example
 * <HeroSection variant="centered" title="당신의 디자인 시스템" subtitle="단 한 줄로 시작하세요" primaryCta={{label:"시작하기"}} />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(function HeroSection(
  {
    variant = "centered",
    eyebrow,
    title,
    subtitle,
    primaryCta,
    secondaryCta,
    media,
    bgImage,
    footer,
    className,
    ...props
  },
  ref,
) {
  const content = (
    <div
      className={cn(
        "flex flex-col gap-5",
        variant === "centered" && "items-center text-center",
        variant === "split" && "max-w-xl",
      )}
    >
      {eyebrow && (
        <div className="text-xs font-semibold uppercase tracking-wider text-primary-ink">{eyebrow}</div>
      )}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && <p className="text-base sm:text-lg text-muted max-w-2xl">{subtitle}</p>}
      {(primaryCta || secondaryCta) && (
        <div className={cn("flex flex-wrap gap-3", variant === "centered" && "justify-center")}>
          {primaryCta && <CtaButton cta={primaryCta} primary />}
          {secondaryCta && <CtaButton cta={secondaryCta} primary={false} />}
        </div>
      )}
      {footer && <div className="mt-4 text-sm text-muted">{footer}</div>}
    </div>
  );

  if (variant === "split") {
    return (
      <section
        ref={ref}
        className={cn(
          "grid lg:grid-cols-2 gap-10 items-center px-4 sm:px-6 py-12 sm:py-20 max-w-7xl mx-auto",
          className,
        )}
        {...props}
      >
        {content}
        <div className="order-first lg:order-last">{media}</div>
      </section>
    );
  }

  if (variant === "imageBg") {
    return (
      <section
        ref={ref}
        className={cn("relative px-4 sm:px-6 py-20 sm:py-32 text-white overflow-hidden", className)}
        style={
          bgImage
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
        {...props}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-5">
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-wider">{eyebrow}</div>
          )}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-lg text-white/90 max-w-2xl">{subtitle}</p>}
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {primaryCta && <CtaButton cta={primaryCta} primary />}
              {secondaryCta && <CtaButton cta={secondaryCta} primary={false} />}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === "minimal") {
    return (
      <section
        ref={ref}
        className={cn("px-4 sm:px-6 py-10 max-w-4xl mx-auto", className)}
        {...props}
      >
        {content}
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={cn("px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto", className)}
      {...props}
    >
      {content}
    </section>
  );
});
