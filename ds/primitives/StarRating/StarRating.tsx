"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";

export type StarRatingSize = "sm" | "md" | "lg";

export interface StarRatingProps {
  /** 현재 값 */
  value: number;
  /** 값 변경 핸들러 */
  onChange?: (value: number) => void;
  /** 최대 별 개수 */
  max?: number;
  /** 크기 */
  size?: StarRatingSize;
  /** 읽기 전용 */
  readonly?: boolean;
  /** 추가 클래스 */
  className?: string;
}

const sizeMap: Record<StarRatingSize, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const gapMap: Record<StarRatingSize, string> = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
};

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}

/**
 * 별점 입력
 * @description 별 아이콘을 사용한 평점 입력/표시 컴포넌트입니다.
 * @example
 * <StarRating value={3} onChange={setRating} />
 * <StarRating value={4.5} max={5} readonly />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function StarRating({
  value,
  onChange,
  max = 5,
  size = "md",
  readonly,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered ?? value;

  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus -- radiogroup is a container; the underlying <button> stars are individually focusable
    <div
      role="radiogroup"
      aria-label="별점"
      className={cn(
        "inline-flex items-center",
        gapMap[size],
        readonly ? "pointer-events-none" : "cursor-pointer",
        className,
      )}
      onMouseLeave={() => !readonly && setHovered(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayValue;

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={starValue <= value}
            aria-label={`${starValue}점`}
            tabIndex={readonly ? -1 : 0}
            disabled={readonly}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHovered(starValue)}
            onKeyDown={(e) => {
              if (readonly) return;
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                const next = Math.min(max, value + 1);
                onChange?.(next);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                const prev = Math.max(1, value - 1);
                onChange?.(prev);
              }
            }}
            className={cn(
              // 바뀌는 것은 색과 크기뿐이다 — all 로 두면 레이아웃 속성까지 전이 대상이 된다
              "inline-flex items-center justify-center rounded-md transition-[color,transform] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              filled
                ? "text-amber-400 drop-shadow-[0_1px_1.5px_rgba(217,119,6,0.35)]"
                : // 빈 별은 다크에서도 보여야 한다 — 고정 회색 대신 muted 를 옅게 깐다
                  "text-muted/35",
              !readonly &&
                "hover:scale-110 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
            )}
          >
            <StarIcon filled={filled} className={sizeMap[size]} />
          </button>
        );
      })}
    </div>
  );
}
