"use client";

import React, { useState } from "react";
import { cn } from "../../utils";

/**
 * 스포일러 블록 컴포넌트
 *
 * - 블러 오버레이로 콘텐츠 숨김
 * - "스포일러 보기" / "내용 보기" 버튼으로 공개
 * - 부드러운 블러 해제 애니메이션
 * - 숨김 상태에서 aria-hidden 적용
 */
export interface SpoilerBlockProps {
  /**
   * 스포일러 종류. `youth` 는 `caution` 의 별칭 —
   * 연령 제한 콘텐츠를 가릴 때 의도가 더 분명하게 읽힌다.
   */
  type?: "spoiler" | "caution" | "youth";
  /** 공개 버튼 라벨 */
  label?: string;
  /**
   * 버튼 위에 띄울 안내 문구 (기본: 종류별 기본 문구).
   *
   * 무엇이 가려져 있는지 알려 줘야 사용자가 열지 말지 판단할 수 있다.
   * `null` 을 주면 문구 없이 버튼만 보여 준다.
   */
  notice?: React.ReactNode;
  /** 내용을 공개했을 때 호출 (분석 이벤트·부모 상태 반영 등) */
  onReveal?: () => void;
  /** 가려질 콘텐츠 */
  children: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
}

const TYPE_CONFIG: Record<
  "spoiler" | "caution",
  { defaultLabel: string; defaultNotice: string; bg: string; border: string; badge: string }
> = {
  spoiler: {
    defaultLabel: "스포일러 보기",
    defaultNotice: "스포일러가 포함된 내용입니다",
    bg: "bg-gray-50",
    border: "border-border",
    badge: "bg-foreground/80 hover:bg-foreground text-background",
  },
  caution: {
    defaultLabel: "내용 보기",
    defaultNotice: "열람에 주의가 필요한 내용이 포함되어 있습니다",
    bg: "bg-warning-light",
    border: "border-warning/30",
    badge: "bg-warning hover:bg-warning/90 text-white",
  },
};

const TYPE_ALIAS: Record<string, keyof typeof TYPE_CONFIG> = {
  youth: "caution",
};

/**
 * 블러 처리된 콘텐츠를 클릭으로 노출하는 스포일러 블록.
 * @example
 * <SpoilerBlock type="blur" label="스포일러 보기">
 *   숨겨진 내용
 * </SpoilerBlock>
 * @status stable
 * @since 2.2.0
 * @tags disclosure
 */
export function SpoilerBlock({
  type = "spoiler",
  label,
  notice,
  onReveal,
  children,
  className,
}: SpoilerBlockProps) {
  const [revealed, setRevealed] = useState(false);
  const config = TYPE_CONFIG[TYPE_ALIAS[type] ?? (type as keyof typeof TYPE_CONFIG)];
  const buttonLabel = label ?? config.defaultLabel;
  const noticeText = notice === undefined ? config.defaultNotice : notice;

  const reveal = () => {
    setRevealed(true);
    onReveal?.();
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border p-4 overflow-hidden transition-all duration-300",
        config.bg,
        config.border,
        className,
      )}
    >
      {/* 콘텐츠 */}
      <div
        className={cn(
          "transition-[filter] duration-500 ease-out",
          revealed ? "blur-0" : "blur-sm select-none pointer-events-none",
        )}
        aria-hidden={!revealed}
      >
        {children}
      </div>

      {/* 오버레이 버튼 */}
      {!revealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
          {noticeText && (
            <p className="text-xs text-muted">{noticeText}</p>
          )}
          <button
            type="button"
            onClick={reveal}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold text-white shadow-md hover:shadow-lg transition-colors",
              config.badge,
            )}
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  );
}
