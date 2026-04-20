"use client";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type TagColor = "gray" | "primary" | "blue" | "green" | "red" | "orange" | "purple" | "teal";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: TagColor;
  /** 닫기 버튼 표시 */
  closable?: boolean;
  onClose?: () => void;
}

const colorStyles: Record<TagColor, string> = {
  gray: "bg-gray-100 text-gray-700",
  primary: "bg-primary-light text-primary",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  orange: "bg-orange-50 text-orange-700",
  purple: "bg-purple-50 text-purple-700",
  teal: "bg-teal-50 text-teal-700",
};

/**
 * 태그/칩
 * @example
 * <Tag color="blue">프론트엔드</Tag>
 * <Tag color="red" closable onClose={handleRemove}>긴급</Tag>
 */
export function Tag({ color = "gray", closable, onClose, className, children, ...props }: TagProps) {
  return (
    <span
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
          className="ml-0.5 hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="삭제"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
