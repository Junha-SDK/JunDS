"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 상품명 */
  title: ReactNode;
  /** 이미지 URL */
  image?: string;
  /** 종횡비 */
  imageRatio?: string;
  /** 가격 표시 (PriceDisplay 또는 ReactNode) */
  price: ReactNode;
  /** 평점 (0~5) */
  rating?: number;
  /** 리뷰 수 */
  reviewCount?: number;
  /** 좌상단 배지 */
  badge?: ReactNode;
  /** 카테고리/브랜드 */
  brand?: string;
  /** 위시리스트 추가 (없으면 버튼 미노출) */
  onWishlist?: () => void;
  /** 위시리스트에 들어있는지 */
  wishlisted?: boolean;
  /** 장바구니 담기 */
  onAddToCart?: () => void;
  /** 장바구니 담기 라벨 */
  addToCartLabel?: string;
  /** 비활성 (품절 등) */
  disabled?: boolean;
  /** 품절 텍스트 */
  outOfStockLabel?: string;
  /** 카드 클릭 (상세 이동) */
  onClick?: () => void;
}

/**
 * e-commerce 상품 카드 (이미지 + 가격 + 평점 + 위시 + 장바구니).
 * @example
 * <ProductCard title="셔츠" image="/p.jpg" price="₩29,000" rating={4.5} reviewCount={128} onAddToCart={()=>{}} />
 * @status stable
 * @since 2.3.0
 * @tags ecommerce
 */
export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(function ProductCard(
  {
    title, image, imageRatio = "1/1", price, rating, reviewCount, badge, brand,
    onWishlist, wishlisted, onAddToCart, addToCartLabel = "장바구니",
    disabled, outOfStockLabel = "품절", onClick, className, ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative group rounded-xl border border-border bg-surface overflow-hidden transition-shadow",
        onClick && !disabled && "cursor-pointer hover:shadow-md",
        disabled && "opacity-60",
        className,
      )}
      onClick={!disabled ? onClick : undefined}
      {...props}
    >
      {badge && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-danger text-white">
          {badge}
        </span>
      )}
      {onWishlist && (
        <button
          type="button"
          aria-label={wishlisted ? "위시리스트에서 제거" : "위시리스트에 추가"}
          aria-pressed={wishlisted || undefined}
          onClick={(e) => { e.stopPropagation(); onWishlist(); }}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="relative bg-surface-soft overflow-hidden" style={{ aspectRatio: imageRatio }}>
        {image ? (
          <img src={image} alt={typeof title === "string" ? title : ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">이미지 없음</div>
        )}
        {disabled && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">{outOfStockLabel}</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        {brand && <div className="text-[10px] uppercase tracking-wider text-muted">{brand}</div>}
        <h3 className="text-sm font-medium line-clamp-2 leading-snug">{title}</h3>
        {rating !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted">
            <span className="text-warning">★</span>
            <span className="font-medium text-foreground tabular-nums">{rating.toFixed(1)}</span>
            {reviewCount !== undefined && <span>({reviewCount.toLocaleString()})</span>}
          </div>
        )}
        <div className="mt-1 text-base font-semibold">{price}</div>
        {onAddToCart && !disabled && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className="mt-3 w-full rounded-md bg-foreground text-background px-3 py-2 text-sm font-semibold hover:opacity-90 cursor-pointer"
          >
            {addToCartLabel}
          </button>
        )}
      </div>
    </div>
  );
});
