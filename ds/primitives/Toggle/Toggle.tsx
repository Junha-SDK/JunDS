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
export function Toggle({
  checked = false,
  onChange,
  size = "md",
  disabled,
  label,
  className,
  ...rest
}: ToggleProps) {
  const ariaLabel = rest["aria-label"] ?? label ?? "토글";
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
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          // 트랙에서 변하는 것은 배경색·그림자·밝기뿐 — transition-all 은 폭까지 물어 리플로우를 부른다
          "relative inline-flex shrink-0 rounded-full transition-[background-color,box-shadow,filter] duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          trackSize[size],
          checked
            ? "bg-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_1px_3px_var(--primary-glow)] hover:brightness-110"
            : // gray-200 은 다크에서 무너진다 — border 토큰이 두 모드 모두에서 꺼진 트랙으로 읽힌다
              "bg-border shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] hover:bg-muted-light/60",
        )}
      >
        <span
          className={cn(
            // 손잡이는 두 모드 모두 흰색이어야 한다. globals 의 다크 오버라이드가 `.bg-white` 를
            // 어두운 표면색으로 덮어써 손잡이가 트랙에 묻히므로 그 규칙을 타지 않는 값으로 적는다.
            "absolute top-[2px] left-[2px] rounded-full bg-[#fff] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
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
