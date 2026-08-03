"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  direction?: "horizontal" | "vertical";
  className?: string;
}

/**
 * 라디오 그룹
 * @example
 * <RadioGroup name="priority" options={[{value:"0",label:"긴급"},{value:"1",label:"높음"}]} value={v} onChange={setV} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { name, options, value, onChange, size = "md", direction = "vertical", className },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-2",
        direction === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className,
      )}
      role="radiogroup"
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "inline-flex items-center gap-2 cursor-pointer select-none",
            opt.disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            disabled={opt.disabled}
            onChange={() => onChange?.(opt.value)}
            className={cn(
              "appearance-none shrink-0 rounded-full border bg-card cursor-pointer",
              // 바뀌는 건 테두리·그림자·눌림뿐이다 — all 로 두면 w/h 까지 전이 대상이 된다
              "transition-[border-color,border-width,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none",
              "border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-muted-light",
              "checked:border-primary checked:shadow-[0_1px_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.08)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "active:scale-90 disabled:cursor-not-allowed",
              size === "sm" ? "w-3.5 h-3.5 checked:border-4" : "w-4 h-4 checked:border-[5px]",
            )}
          />
          <span className={cn("text-foreground", size === "sm" ? "text-xs" : "text-sm")}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
});

RadioGroup.displayName = "RadioGroup";
