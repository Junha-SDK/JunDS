"use client";
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
 */
export function RadioGroup({ name, options, value, onChange, size = "md", direction = "vertical", className }: RadioGroupProps) {
  return (
    <div className={cn("flex gap-2", direction === "vertical" ? "flex-col" : "flex-row flex-wrap", className)} role="radiogroup">
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
              "accent-primary cursor-pointer",
              size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
            )}
          />
          <span className={cn("text-foreground", size === "sm" ? "text-xs" : "text-sm")}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
