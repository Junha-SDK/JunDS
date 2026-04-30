"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type AnnouncementVariant = "neutral" | "primary" | "success" | "warning" | "danger";

export interface AnnouncementBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 메시지 본문 */
  message: ReactNode;
  /** 우측 CTA 텍스트 */
  ctaLabel?: string;
  /** CTA 링크 */
  ctaHref?: string;
  /** CTA 클릭 핸들러 (href 없을 때) */
  onCta?: () => void;
  /** 색상 톤 */
  variant?: AnnouncementVariant;
  /** 닫기 가능 여부 */
  dismissible?: boolean;
  /** localStorage 영속 키 (있으면 닫기 상태 기억) */
  storageKey?: string;
  /** 좌측 아이콘 */
  icon?: ReactNode;
  /** 닫힘 콜백 */
  onDismiss?: () => void;
}

const variantClass: Record<AnnouncementVariant, string> = {
  neutral: "bg-foreground text-background",
  primary: "bg-primary text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
};

/**
 * 사이트 최상단 공지바 (Banner와 달리 sticky/dismissible 영속).
 * @example
 * <AnnouncementBar message="🎉 신규 기능" ctaLabel="자세히" ctaHref="/x" storageKey="ann-2026" />
 * @status stable
 * @since 2.3.0
 * @tags feedback
 */
export const AnnouncementBar = forwardRef<HTMLDivElement, AnnouncementBarProps>(function AnnouncementBar(
  { message, ctaLabel, ctaHref, onCta, variant = "primary", dismissible = true, storageKey, icon, onDismiss, className, ...props },
  ref,
) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    try {
      if (localStorage.getItem(`junds-ann-${storageKey}`) === "1") setDismissed(true);
    } catch {}
  }, [storageKey]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      try { localStorage.setItem(`junds-ann-${storageKey}`, "1"); } catch {}
    }
    onDismiss?.();
  };

  return (
    <div
      ref={ref}
      role="region"
      aria-label="공지"
      className={cn(
        "flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium",
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="text-center">{message}</span>
      {ctaLabel && (
        ctaHref ? (
          <a href={ctaHref} className="shrink-0 underline underline-offset-2 hover:opacity-80">{ctaLabel}</a>
        ) : (
          <button type="button" onClick={onCta} className="shrink-0 underline underline-offset-2 hover:opacity-80 cursor-pointer">{ctaLabel}</button>
        )
      )}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="공지 닫기"
          className="shrink-0 ml-2 p-1 rounded hover:bg-white/20 transition-colors cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
});
