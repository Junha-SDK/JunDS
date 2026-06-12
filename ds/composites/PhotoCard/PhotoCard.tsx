"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface PhotoCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 사진 URL */
  src: string;
  /** alt 텍스트 (a11y 필수) */
  alt: string;
  /** 캡션 */
  title?: ReactNode;
  /** 부가 정보 (위치, 날짜 등) */
  meta?: ReactNode;
  /** 좋아요 수 */
  likes?: number;
  /** 댓글 수 */
  comments?: number;
  /** 종횡비 (CSS aspect-ratio 표현) */
  aspectRatio?: string;
  /** 호버 시 살짝 떠오르는 효과 */
  interactive?: boolean;
  /** 우상단 배지 */
  badge?: ReactNode;
}

/**
 * 사진 카드 — 이미지 + 캡션 + 좋아요/댓글 메타.
 * @example
 * <PhotoCard src="/p.jpg" alt="해변" title="동해" meta="2026.04" likes={142} comments={8} interactive />
 * @status stable
 * @since 2.4.0
 * @tags photo, media
 */
export const PhotoCard = forwardRef<HTMLElement, PhotoCardProps>(
  ({ src, alt, title, meta, likes, comments, aspectRatio = "4 / 5", interactive, badge, className, ...props }, ref) => (
    <figure
      ref={ref}
      className={cn(
        "group rounded-xl overflow-hidden bg-surface border border-border",
        interactive && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
        className,
      )}
      {...props}
    >
      <div className="relative" style={{ aspectRatio }}>
        <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
        {badge && (
          <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur">
            {badge}
          </span>
        )}
      </div>
      {(title || meta || likes !== undefined || comments !== undefined) && (
        <figcaption className="p-3">
          {title && <p className="text-sm font-medium text-foreground truncate">{title}</p>}
          {meta && <p className="text-[11px] text-muted mt-0.5">{meta}</p>}
          {(likes !== undefined || comments !== undefined) && (
            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
              {likes !== undefined && <span aria-label={`좋아요 ${likes}`}>❤ {likes.toLocaleString()}</span>}
              {comments !== undefined && <span aria-label={`댓글 ${comments}`}>💬 {comments.toLocaleString()}</span>}
            </div>
          )}
        </figcaption>
      )}
    </figure>
  ),
);
PhotoCard.displayName = "PhotoCard";
