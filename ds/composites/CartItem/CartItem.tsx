"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface CartItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 상품명 */
  title: ReactNode;
  /** 옵션/사이즈/색상 등 보조 정보 */
  variant?: ReactNode;
  /** 썸네일 URL */
  image?: string;
  /** 단가 */
  price: ReactNode;
  /** 합계 (수량 × 단가) */
  subtotal?: ReactNode;
  /** 수량 */
  quantity: number;
  /** 수량 변경 콜백 */
  onQuantityChange?: (q: number) => void;
  /** 최소 수량 */
  min?: number;
  /** 최대 수량 (재고) */
  max?: number;
  /** 삭제 콜백 (있으면 X 버튼 노출) */
  onRemove?: () => void;
  /** 비활성 (품절 등) */
  disabled?: boolean;
}

/**
 * 장바구니 아이템 행 (이미지 + 정보 + 수량조절 + 가격 + 삭제).
 * @example
 * <CartItem title="셔츠" image="/x.jpg" price="₩29,000" quantity={2} subtotal="₩58,000" onQuantityChange={...} onRemove={...} />
 * @status stable
 * @since 2.3.0
 * @tags ecommerce
 */
export const CartItem = forwardRef<HTMLDivElement, CartItemProps>(function CartItem(
  {
    title,
    variant,
    image,
    price,
    subtotal,
    quantity,
    onQuantityChange,
    min = 1,
    max,
    onRemove,
    disabled,
    className,
    ...props
  },
  ref,
) {
  const dec = () => onQuantityChange?.(Math.max(min, quantity - 1));
  const inc = () => onQuantityChange?.(max ? Math.min(max, quantity + 1) : quantity + 1);

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-4 py-4 border-b border-border last:border-b-0",
        disabled && "opacity-60",
        className,
      )}
      {...props}
    >
      {image && (
        <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-surface-soft ring-1 ring-border-light">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium leading-snug truncate">{title}</h4>
        {variant && <div className="mt-0.5 text-xs text-muted truncate">{variant}</div>}
        <div className="mt-2 text-sm text-muted whitespace-nowrap tabular-nums">{price}</div>
        {onQuantityChange && (
          <div className="mt-2 inline-flex items-center rounded-xl border border-border bg-card overflow-hidden text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
            <button
              type="button"
              onClick={dec}
              disabled={disabled || quantity <= min}
              aria-label="수량 감소"
              className={cn(
                "w-8 h-8 flex items-center justify-center cursor-pointer transition-colors",
                "hover:bg-surface-soft active:bg-border-light",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
              )}
            >
              −
            </button>
            <span
              className="w-10 text-center font-medium tabular-nums border-x border-border-light"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={inc}
              disabled={disabled || (max !== undefined && quantity >= max)}
              aria-label="수량 증가"
              className={cn(
                "w-8 h-8 flex items-center justify-center cursor-pointer transition-colors",
                "hover:bg-surface-soft active:bg-border-light",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
              )}
            >
              +
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {subtotal && (
          <div className="text-sm font-semibold whitespace-nowrap tabular-nums">{subtotal}</div>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="삭제"
            className={cn(
              "-mx-1 rounded-lg px-1 py-0.5 text-xs text-muted cursor-pointer whitespace-nowrap",
              "transition-colors hover:text-danger",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
});
