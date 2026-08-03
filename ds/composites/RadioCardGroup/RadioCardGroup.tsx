"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";
import type { HTMLAttributes, ReactNode } from "react";

export interface RadioCardOption {
  /** value */
  value: string;
  /** 제목 */
  title: ReactNode;
  /** 설명 */
  description?: ReactNode;
  /** 좌측 아이콘/이미지 */
  icon?: ReactNode;
  /** 우측 보조 라벨 */
  badge?: ReactNode;
  /** 비활성화 */
  disabled?: boolean;
}

export interface RadioCardGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** 옵션 목록 */
  options: RadioCardOption[];
  /** 선택값 */
  value?: string;
  /** 기본값 */
  defaultValue?: string;
  /** 변경 콜백 */
  onChange?: (value: string) => void;
  /** name (form 통합) */
  name?: string;
  /** 컬럼 수 */
  columns?: number;
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
}

/**
 * 라디오 카드 그룹 — 옵션을 풍부한 카드로 표현 (요금제, 결제수단 등).
 * @example
 * <RadioCardGroup options={[{value:"a",title:"기본",description:"가벼운 시작"}, ...]} />
 * @status stable
 * @since 2.3.0
 * @tags input
 */
export const RadioCardGroup = forwardRef<HTMLDivElement, RadioCardGroupProps>(
  function RadioCardGroup(
    {
      options,
      value,
      defaultValue,
      onChange,
      name,
      columns = 1,
      asChild,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const [internal, setInternal] = useState(defaultValue ?? "");
    const selected = value ?? internal;

    const select = (v: string) => {
      if (!value) setInternal(v);
      onChange?.(v);
    };

    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref as never}
        role="radiogroup"
        className={cn("grid gap-2", className)}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        {...props}
      >
        {asChild ? <Slottable>{children}</Slottable> : null}
        {options.map((opt) => {
          const isSelected = opt.value === selected;
          return (
            <label
              key={opt.value}
              className={cn(
                "relative flex items-start gap-3 rounded-xl border p-3 cursor-pointer",
                "transition-[background-color,border-color,box-shadow] duration-150",
                // 포커스를 받는 건 안쪽 radio 다 — 어느 카드에 있는지는 카드가 보여 준다.
                "focus-within:ring-2 focus-within:ring-primary/55 focus-within:ring-offset-2 focus-within:ring-offset-background",
                isSelected
                  ? // bg-primary-soft 는 @theme 에 없는 이름이라 선택 배경이 칠해지지 않았다.
                    "border-primary bg-primary-light ring-1 ring-primary/30 shadow-[0_2px_10px_-4px_var(--primary-glow)]"
                  : "border-border bg-surface hover:bg-surface-soft shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                opt.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                disabled={opt.disabled}
                onChange={() => select(opt.value)}
                className="mt-1 accent-primary"
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
      </Comp>
    );
  },
);
