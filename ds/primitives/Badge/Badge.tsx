"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";
export type BadgeSize = "sm" | "md" | "lg";

/**
 * 상태나 카테고리를 표시하는 작은 라벨.
 *
 * variant로 색상을, dot으로 상태 점을, count로 숫자를 표시합니다.
 *
 * @example
 * <Badge variant="success" dot>활성</Badge>
 * <Badge count={42} maxCount={99} />
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * 뱃지 색상 변형.
   * - `"default"` — 회색. 일반 태그, 라벨에 사용합니다.
   * - `"primary"` — 파란색 계열. 주요 항목 강조에 사용합니다.
   * - `"success"` — 초록색. 완료, 활성, 정상 상태를 나타냅니다.
   * - `"warning"` — 노란색. 주의, 대기 상태를 나타냅니다.
   * - `"danger"` — 빨간색. 오류, 긴급, 삭제 상태를 나타냅니다.
   * - `"info"` — 파란색. 정보성 태그에 사용합니다.
   * - `"outline"` — 투명 배경 + 테두리. 미묘한 강조에 사용합니다.
   *
   * @default "default"
   */
  variant?: BadgeVariant;
  /**
   * 뱃지 크기.
   * - `"sm"` — 작은 크기 (10px 텍스트). 밀집된 UI에 적합합니다.
   * - `"md"` — 기본 크기 (12px 텍스트).
   * - `"lg"` — 큰 크기 (14px 텍스트). 눈에 잘 띄어야 할 때 사용합니다.
   *
   * @default "md"
   */
  size?: BadgeSize;
  /**
   * 라벨 왼쪽에 작은 색상 점을 표시합니다.
   * 온라인/오프라인 등 상태 표시에 적합합니다.
   *
   * @default false
   * @example <Badge variant="success" dot>온라인</Badge>
   */
  dot?: boolean;
  /**
   * 숫자 카운트 모드.
   * 설정하면 children 대신 숫자가 원형 뱃지로 표시됩니다.
   * 알림 수, 읽지 않은 메시지 수 등에 사용합니다.
   *
   * @example <Badge count={5} variant="danger" />
   */
  count?: number;
  /**
   * 최대 표시 숫자.
   * count가 이 값을 초과하면 "99+" 형태로 표시됩니다.
   *
   * @default 99
   * @example <Badge count={150} maxCount={99} /> // "99+" 표시
   */
  maxCount?: number;
  /**
   * 라벨 왼쪽에 표시되는 아이콘.
   * 뱃지의 의미를 시각적으로 보강할 때 사용합니다.
   *
   * @example icon={<CheckIcon />}
   */
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-500/10 text-gray-700 shadow-[0_0_0_1px_inset_rgba(0,0,0,0.06)]",
  primary: "bg-primary/10 text-primary shadow-[0_0_0_1px_inset] shadow-primary/15",
  success: "bg-success/10 text-success shadow-[0_0_0_1px_inset] shadow-success/15",
  warning: "bg-warning/10 text-warning shadow-[0_0_0_1px_inset] shadow-warning/15",
  danger: "bg-danger/10 text-danger shadow-[0_0_0_1px_inset] shadow-danger/15",
  info: "bg-blue-500/10 text-blue-700 shadow-[0_0_0_1px_inset] shadow-blue-500/15",
  outline: "bg-transparent border border-border text-foreground",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] rounded-md",
  md: "px-2.5 py-1 text-xs rounded-lg",
  lg: "px-3 py-1 text-sm rounded-lg",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-gray-400",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-blue-500",
  outline: "bg-foreground",
};

/**
 * 상태나 카테고리를 표시하는 작은 라벨.
 *
 * variant로 색상을, dot으로 상태 점을, count로 숫자를 표시합니다.
 *
 * @example
 * <Badge variant="success" dot>활성</Badge>
 * <Badge count={42} maxCount={99} />
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({
  variant = "default",
  size = "md",
  dot,
  count,
  maxCount = 99,
  icon,
  className,
  children,
  ...props
}, ref) {
  if (count !== undefined) {
    const display = count > maxCount ? `${maxCount}+` : count;
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold tabular-nums",
          "min-w-[18px] h-[18px] px-1 text-[10px]",
          "bg-danger text-white",
          className,
        )}
        {...props}
      >
        {display}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 font-semibold tracking-wide whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
});

Badge.displayName = "Badge";
