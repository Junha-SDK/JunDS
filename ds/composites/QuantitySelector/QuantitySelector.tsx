"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";
import type { HTMLAttributes } from "react";

export type QuantitySize = "sm" | "md" | "lg";

export interface QuantitySelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 현재 값 (controlled) */
  value?: number;
  /** 기본값 */
  defaultValue?: number;
  /** 변경 콜백 */
  onChange?: (q: number) => void;
  /** 최소 */
  min?: number;
  /** 최대 (재고) */
  max?: number;
  /** 증감 단위 */
  step?: number;
  /** 비활성 */
  disabled?: boolean;
  /** 크기 */
  size?: QuantitySize;
  /** input 직접 편집 허용 */
  editable?: boolean;
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
}

const sizeMap: Record<QuantitySize, { btn: string; input: string }> = {
  sm: { btn: "w-7 h-7 text-sm", input: "w-9 text-xs" },
  md: { btn: "w-9 h-9 text-base", input: "w-12 text-sm" },
  lg: { btn: "w-11 h-11 text-lg", input: "w-14 text-base" },
};

/**
 * 단독 수량 선택기 (CartItem 외에도 단일 사용 가능).
 * @example
 * <QuantitySelector defaultValue={1} max={10} onChange={console.log} />
 * @status stable
 * @since 2.3.0
 * @tags ecommerce
 */
export const QuantitySelector = forwardRef<HTMLDivElement, QuantitySelectorProps>(
  function QuantitySelector(
    {
      value,
      defaultValue = 1,
      onChange,
      min = 1,
      max,
      step = 1,
      disabled,
      size = "md",
      editable = true,
      asChild,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;

    const setValue = (n: number) => {
      let next = Math.max(min, n);
      if (max !== undefined) next = Math.min(max, next);
      if (!value) setInternal(next);
      onChange?.(next);
    };

    const dec = () => setValue(current - step);
    const inc = () => setValue(current + step);

    const sz = sizeMap[size];

    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref as never}
        role="group"
        aria-label="수량"
        className={cn(
          "inline-flex items-center rounded-md border border-border overflow-hidden",
          className,
        )}
        {...props}
      >
        {asChild ? <Slottable>{children}</Slottable> : null}
        <button
          type="button"
          onClick={dec}
          disabled={disabled || current <= min}
          aria-label="수량 감소"
          className={cn(
            "flex items-center justify-center hover:bg-surface-soft disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer",
            sz.btn,
          )}
        >
          −
        </button>
        {editable ? (
          <input
            type="number"
            value={current}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!Number.isNaN(n)) setValue(n);
            }}
            aria-label="수량"
            className={cn(
              "text-center font-medium tabular-nums bg-transparent border-x border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/55 [&::-webkit-inner-spin-button]:appearance-none",
              sz.input,
              sz.btn,
            )}
          />
        ) : (
          <span
            className={cn(
              "text-center font-medium tabular-nums border-x border-border flex items-center justify-center",
              sz.input,
              sz.btn,
            )}
            aria-live="polite"
          >
            {current}
          </span>
        )}
        <button
          type="button"
          onClick={inc}
          disabled={disabled || (max !== undefined && current >= max)}
          aria-label="수량 증가"
          className={cn(
            "flex items-center justify-center hover:bg-surface-soft disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer",
            sz.btn,
          )}
        >
          +
        </button>
      </Comp>
    );
  },
);
