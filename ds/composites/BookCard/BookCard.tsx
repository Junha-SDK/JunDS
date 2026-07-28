"use client";

import React from "react";
import { cn } from "../../utils";

/**
 * 북카드 컴포넌트
 *
 * - 커버 이미지 + 광택 효과 (sheen overlay)
 * - 그레인 텍스처 오버레이
 * - 잠금 상태 배지 + "열쇠가 필요합니다" 표시
 * - 호버: 기울기 + 그림자 효과
 * - 커버 없을 시 그라데이션 폴백
 */
export interface BookCardProps {
  /** 작품 제목 */
  title: string;
  /** 저자명 */
  author?: string;
  /** 커버 이미지 URL */
  coverImage?: string;
  /** 잠금 상태 */
  locked?: boolean;
  /** 작품 유형 */
  kind?: string;
  /** 카드 클릭 콜백 */
  onClick?: () => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 책 표지 + 제목 + 저자 정보를 담은 책 형태의 카드.
 * @example
 * <BookCard title="Atomic Design" author="Brad Frost" coverImage="/cover.jpg" />
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export function BookCard({
  title,
  author,
  coverImage,
  locked = false,
  kind,
  onClick,
  className,
}: BookCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative block w-full text-left rounded-xl overflow-hidden cursor-pointer",
        "shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]",
        // 떠오르는 건 transform·shadow 뿐 — all 이면 카드 내부 크기 변화까지 전이된다
        "transition-[transform,box-shadow] duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_18px_36px_-12px_rgba(0,0,0,0.35),0_6px_12px_-6px_rgba(0,0,0,0.2)]",
        "active:-translate-y-0",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={
        locked ? `${title} \u2014 \uC5F4\uC1E0\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4` : title
      }
      title={locked ? "\uC5F4\uC1E0\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4" : title}
    >
      {/* 커버 영역 */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800"
            aria-hidden="true"
          />
        )}

        {/* 광택 (sheen) */}
        <span
          className={cn(
            "absolute inset-0 pointer-events-none",
            "bg-gradient-to-br from-white/25 via-transparent to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          )}
          aria-hidden="true"
        />

        {/* 그레인 텍스처 */}
        <span
          className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />

        {/* 잠금 오버레이 */}
        {locked && (
          <>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" aria-hidden="true" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
              <span className="text-3xl" aria-hidden="true">
                {"\u{1F512}"}
              </span>
              <span className="text-xs font-medium opacity-80">
                {"\uC5F4\uC1E0\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 메타 정보 */}
      <div className="p-3 bg-card">
        <div className="text-sm font-semibold text-foreground truncate">{title}</div>
        <div className="flex items-center gap-2 mt-1 min-w-0">
          {kind && <span className="text-xs text-muted truncate">{kind}</span>}
          {author && <span className="text-xs text-muted-light truncate">{author}</span>}
        </div>
        {locked && (
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded-lg bg-warning-light text-warning">
            {"\uAD8C\uD55C \uD544\uC694"}
          </span>
        )}
      </div>
    </button>
  );
}
