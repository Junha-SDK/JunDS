"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface CheckboxCardOption {
  value: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface CheckboxCardGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** 옵션 */
  options: CheckboxCardOption[];
  /** 선택값 */
  value?: string[];
  /** 기본값 */
  defaultValue?: string[];
  /** 변경 콜백 */
  onChange?: (values: string[]) => void;
  /** 컬럼 수 */
  columns?: number;
  /** 최대 선택 개수 */
  max?: number;
}

/**
 * 체크박스 카드 그룹 — 다중 선택 가능한 풍부한 카드.
 * @example
 * <CheckboxCardGroup options={[{value:"a",title:"옵션 A"}]} onChange={console.log} />
 * @status stable
 * @since 2.3.0
 * @tags input
 */
export const CheckboxCardGroup = forwardRef<HTMLDivElement, CheckboxCardGroupProps>(
  function CheckboxCardGroup(
    { options, value, defaultValue = [], onChange, columns = 1, max, className, ...props },
    ref,
  ) {
    const [internal, setInternal] = useState<string[]>(defaultValue);
    const selected = value ?? internal;

    const toggle = (v: string) => {
      let next: string[];
      if (selected.includes(v)) {
        next = selected.filter((x) => x !== v);
      } else {
        if (max !== undefined && selected.length >= max) return;
        next = [...selected, v];
      }
      if (!value) setInternal(next);
      onChange?.(next);
    };

    return (
      <div
        ref={ref}
        role="group"
        className={cn("grid gap-2", className)}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        {...props}
      >
        {options.map((opt) => {
          const isChecked = selected.includes(opt.value);
          const reachedMax = !isChecked && max !== undefined && selected.length >= max;
          return (
            <label
              key={opt.value}
              className={cn(
                "relative flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                // 포커스는 안의 체크박스가 받는다 — 링은 카드 전체에 그려야 무엇이 선택될지 보인다
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/55 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                isChecked
                  ? "border-primary bg-primary-light ring-1 ring-primary/30"
                  : "border-border bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] hover:bg-surface-soft hover:border-primary/40",
                (opt.disabled || reachedMax) && "opacity-50 cursor-not-allowed",
              )}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={opt.disabled || reachedMax}
                onChange={() => toggle(opt.value)}
                className="mt-1 accent-primary focus-visible:outline-none"
              />
              {opt.icon && <span className="shrink-0 mt-0.5 text-lg">{opt.icon}</span>}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{opt.title}</div>
                {opt.description && (
                  <div className="mt-0.5 text-xs text-muted">{opt.description}</div>
                )}
              </div>
              {opt.badge && <span className="shrink-0 text-xs text-muted">{opt.badge}</span>}
            </label>
          );
        })}
      </div>
    );
  },
);
