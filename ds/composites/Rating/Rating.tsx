"use client";
import { useState, useCallback, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface RatingProps {
  /** 현재 평점 값 */
  value: number;
  /** 값 변경 콜백 */
  onChange?: (value: number) => void;
  /** 최대 별 개수 */
  max?: number;
  /** 0.5 단위 평점 허용 여부 */
  half?: boolean;
  /** 별 크기 */
  size?: "sm" | "md" | "lg";
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** 추가 클래스 */
  className?: string;
}

const sizes = { sm: 16, md: 20, lg: 28 };

/**
 * 평점 입력 컴포넌트
 * @example
 * <Rating value={3} onChange={setValue} max={5} half />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  ({
  value, onChange, max = 5, half = false,
  size = "md", disabled, readOnly, className,
}, ref) => {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const starSize = sizes[size];
  const interactive = !disabled && !readOnly && !!onChange;

  const handleClick = useCallback((star: number, isHalf: boolean) => {
    if (!interactive) return;
    onChange?.(isHalf && half ? star - 0.5 : star);
  }, [interactive, onChange, half]);

  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus -- radiogroup is a container; the underlying <button> stars are individually focusable
    <div
      ref={ref}
      className={cn("inline-flex items-center gap-0.5", disabled && "opacity-50", className)}
      role="radiogroup"
      aria-label="평점"
      onMouseLeave={() => interactive && setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = display >= star;
        const halfFilled = half && display >= star - 0.5 && display < star;

        return (
          <span
            key={i}
            className={cn(
              "relative inline-flex transition-transform duration-150",
              interactive && "cursor-pointer hover:scale-110 active:scale-95",
              (filled || halfFilled) && "drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.15)]",
            )}
            onMouseMove={(e) => {
              if (!interactive) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const isLeft = e.clientX - rect.left < rect.width / 2;
              setHover(half && isLeft ? star - 0.5 : star);
            }}
            onClick={(e) => {
              if (!interactive) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const isLeft = e.clientX - rect.left < rect.width / 2;
              handleClick(star, isLeft);
            }}
            role="radio"
            aria-checked={value === star || (half && value === star - 0.5)}
            aria-label={`${star}점`}
            tabIndex={interactive ? 0 : -1}
            onKeyDown={(e) => {
              if (!interactive) return;
              if (e.key === "ArrowRight") onChange?.(Math.min(value + (half ? 0.5 : 1), max));
              if (e.key === "ArrowLeft") onChange?.(Math.max(value - (half ? 0.5 : 1), 0));
            }}
          >
            <svg width={starSize} height={starSize} viewBox="0 0 24 24" fill="none">
              {halfFilled && (
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="var(--warning)" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={filled ? "var(--warning)" : halfFilled ? `url(#half-${i})` : "rgba(0,0,0,0.04)"}
                stroke={filled || halfFilled ? "var(--warning)" : "var(--border)"}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      })}
    </div>
  );
},
);
Rating.displayName = "Rating";
