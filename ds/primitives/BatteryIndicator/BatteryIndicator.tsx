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

// prop 이름이 이미 의미색이다 — 팔레트 리터럴 대신 같은 이름의 토큰에 붙인다
const colorMap: Record<NonNullable<BatteryIndicatorProps["color"]>, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  primary: "bg-primary",
};

const sizeStyles: Record<
  NonNullable<BatteryIndicatorProps["size"]>,
  { body: string; cap: string }
> = {
  sm: { body: "h-4 w-10", cap: "w-1 h-2" },
  md: { body: "h-6 w-14", cap: "w-1.5 h-3" },
  lg: { body: "h-8 w-20", cap: "w-2 h-4" },
};

function getAutoColor(value: number): string {
  if (value > 70) return "bg-success";
  if (value > 30) return "bg-warning";
  return "bg-danger";
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
    fillColor = "bg-primary";
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 hover:scale-105 transition-transform duration-200",
        "motion-reduce:transition-none motion-reduce:hover:scale-100",
        className,
      )}
    >
      {label && <span className="text-xs font-medium text-muted whitespace-nowrap">{label}</span>}
      <div className="inline-flex items-center">
        {/* 배터리 본체 */}
        <div
          className={cn(
            "relative rounded-sm border-2 border-muted-light overflow-hidden",
            sizeStyle.body,
          )}
        >
          {/* 충전 레벨 — width 전이는 프레임마다 리플로우를 낸다. 합성만으로 끝나는 scaleX 로 채운다 */}
          <div
            className={cn(
              "absolute inset-0 origin-left transition-transform duration-500 ease-out",
              "motion-reduce:transition-none",
              fillColor,
            )}
            style={{ transform: `scaleX(${clamped / 100})` }}
          />

          {/* 퍼센트 텍스트 (lg 사이즈만) */}
          {size === "lg" && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums text-white mix-blend-difference">
              {Math.round(clamped)}%
            </span>
          )}
        </div>

        {/* 배터리 캡 */}
        <div className={cn("rounded-r-sm bg-muted-light", sizeStyle.cap)} />
      </div>
    </div>
  );
}
