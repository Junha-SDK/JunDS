"use client";
import { cn } from "../../utils/cn";

export interface BatteryIndicatorProps {
  /** 0-100 퍼센트 */
  value: number;
  /** 상태에 따른 색상 자동 적용 (>70 green, >30 yellow, else red) */
  autoColor?: boolean;
  /** 수동 색상 */
  color?: "success" | "warning" | "danger" | "primary";
  /** 라벨 */
  label?: string;
  /** 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 클래스 */
  className?: string;
}

const colorMap: Record<NonNullable<BatteryIndicatorProps["color"]>, string> = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  primary: "bg-blue-500",
};

const sizeStyles: Record<NonNullable<BatteryIndicatorProps["size"]>, { body: string; cap: string }> = {
  sm: { body: "h-4 w-10", cap: "w-1 h-2" },
  md: { body: "h-6 w-14", cap: "w-1.5 h-3" },
  lg: { body: "h-8 w-20", cap: "w-2 h-4" },
};

function getAutoColor(value: number): string {
  if (value > 70) return "bg-green-500";
  if (value > 30) return "bg-amber-500";
  return "bg-red-500";
}

/**
 * 배터리 인디케이터
 * 레벨/퍼센티지를 배터리 형태로 시각화합니다.
 * @example
 * <BatteryIndicator value={75} autoColor />
 * <BatteryIndicator value={30} color="warning" size="lg" label="배터리" />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function BatteryIndicator({
  value,
  autoColor = false,
  color,
  label,
  size = "md",
  className,
}: BatteryIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const sizeStyle = sizeStyles[size];

  let fillColor: string;
  if (autoColor) {
    fillColor = getAutoColor(clamped);
  } else if (color) {
    fillColor = colorMap[color];
  } else {
    fillColor = "bg-blue-500";
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 hover:scale-105 transition-transform duration-200", className)}>
      {label && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      )}
      <div className="inline-flex items-center">
        {/* 배터리 본체 */}
        <div
          className={cn(
            "relative rounded-sm border-2 border-gray-400 dark:border-gray-500 overflow-hidden",
            sizeStyle.body,
          )}
        >
          {/* 충전 레벨 */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 transition-all duration-500 ease-out",
              fillColor,
            )}
            style={{ width: `${clamped}%` }}
          />

          {/* 퍼센트 텍스트 (lg 사이즈만) */}
          {size === "lg" && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
              {Math.round(clamped)}%
            </span>
          )}
        </div>

        {/* 배터리 캡 */}
        <div
          className={cn(
            "rounded-r-sm bg-gray-400 dark:bg-gray-500",
            sizeStyle.cap,
          )}
        />
      </div>
    </div>
  );
}
