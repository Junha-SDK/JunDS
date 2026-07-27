"use client";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps {
  /** 체크 상태 */
  checked: boolean;
  /** 상태 변경 핸들러 */
  onChange: (checked: boolean) => void;
  /** 비활성화 */
  disabled?: boolean;
  /** 크기 */
  size?: SwitchSize;
  /** 레이블 */
  label?: string;
  /** 추가 클래스 */
  className?: string;
}

const trackSize: Record<SwitchSize, string> = {
  sm: "w-9 h-5",
  md: "w-11 h-6",
  lg: "w-14 h-7",
};

const thumbSize: Record<SwitchSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4.5 h-4.5",
  lg: "w-5.5 h-5.5",
};

const thumbTranslate: Record<SwitchSize, string> = {
  sm: "translate-x-[16px]",
  md: "translate-x-[20px]",
  lg: "translate-x-[28px]",
};

/**
 * iOS 스타일 스위치
 * @description Toggle과 유사하지만 iOS 스타일의 둥근 스위치 UI를 제공합니다.
 * @example
 * <Switch checked={on} onChange={setOn} label="알림 수신" />
 * <Switch checked={on} onChange={setOn} size="lg" />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function Switch({
  checked,
  onChange,
  disabled,
  size = "md",
  label,
  className,
}: SwitchProps) {
  const t = useT();
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ?? t("ariaSwitch")}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 rounded-full transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          trackSize[size],
          checked
            ? "bg-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_1px_3px_var(--primary-glow)] hover:brightness-110"
            : "bg-gray-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] hover:bg-gray-300/80",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 -translate-y-1/2 left-[3px] rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_1px_rgba(0,0,0,0.08)]",
            thumbSize[size],
            checked && thumbTranslate[size],
          )}
        />
      </button>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
