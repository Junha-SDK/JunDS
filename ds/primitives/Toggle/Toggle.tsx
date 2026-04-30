"use client";
import { cn } from "../../utils/cn";

export type ToggleSize = "sm" | "md";

export interface ToggleProps {
  /** 체크 상태 */
  checked?: boolean;
  /** 상태 변경 콜백 */
  onChange?: (checked: boolean) => void;
  /** 토글 크기 */
  size?: ToggleSize;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 옆에 표시할 라벨 */
  label?: string;
  /** 시각 라벨이 없을 때 사용할 접근성 라벨 (기본: label 사용) */
  "aria-label"?: string;
  /** 추가 클래스 */
  className?: string;
}

const trackSize: Record<ToggleSize, string> = {
  sm: "w-8 h-[18px]",
  md: "w-10 h-[22px]",
};
const thumbSize: Record<ToggleSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
};
const thumbTranslate: Record<ToggleSize, string> = {
  sm: "translate-x-[14px]",
  md: "translate-x-[18px]",
};

/**
 * 토글 스위치
 * @example
 * <Toggle checked={on} onChange={setOn} label="알림" />
 * @status stable
 * @since 2.2.0
 * @tags form, control
 */
export function Toggle({ checked = false, onChange, size = "md", disabled, label, className, ...rest }: ToggleProps) {
  const ariaLabel = rest["aria-label"] ?? label ?? "토글";
  return (
    <label className={cn("inline-flex items-center gap-2 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative inline-flex shrink-0 rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1",
          trackSize[size],
          checked ? "bg-primary" : "bg-gray-300",
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] left-[2px] rounded-full bg-white shadow-sm transition-transform duration-200",
            thumbSize[size],
            checked && thumbTranslate[size],
          )}
        />
      </button>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
