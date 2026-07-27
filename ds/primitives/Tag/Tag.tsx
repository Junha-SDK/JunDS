"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type TagColor = "gray" | "primary" | "blue" | "green" | "red" | "orange" | "purple" | "teal";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** 태그 색상 */
  color?: TagColor;
  /** 닫기 버튼 표시 */
  closable?: boolean;
  /** 닫기 버튼 클릭 콜백 */
  onClose?: () => void;
}

const colorStyles: Record<TagColor, string> = {
  gray: "bg-gray-100 text-gray-700 shadow-[0_0_0_1px_inset_rgba(0,0,0,0.05)]",
  primary: "bg-primary-light text-primary shadow-[0_0_0_1px_inset] shadow-primary/15",
  blue: "bg-blue-50 text-blue-700 shadow-[0_0_0_1px_inset] shadow-blue-600/15",
  green: "bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_inset] shadow-emerald-600/15",
  red: "bg-red-50 text-red-700 shadow-[0_0_0_1px_inset] shadow-red-600/15",
  orange: "bg-orange-50 text-orange-700 shadow-[0_0_0_1px_inset] shadow-orange-600/15",
  purple: "bg-purple-50 text-purple-700 shadow-[0_0_0_1px_inset] shadow-purple-600/15",
  teal: "bg-teal-50 text-teal-700 shadow-[0_0_0_1px_inset] shadow-teal-600/15",
};

/**
 * 태그/칩
 * @example
 * <Tag color="blue">프론트엔드</Tag>
 * <Tag color="red" closable onClose={handleRemove}>긴급</Tag>
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag({ color = "gray", closable, onClose, className, children, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        colorStyles[color],
        className,
      )}
      {...props}
    >
      {children}
      {closable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="ml-0.5 -mr-0.5 rounded-full p-0.5 hover:bg-black/10 active:bg-black/15 transition-colors cursor-pointer"
          aria-label="삭제"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
});

Tag.displayName = "Tag";
