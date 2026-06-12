"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type BookCoverSize = "sm" | "md" | "lg" | "xl";
export type BookCoverEffect = "flat" | "tilt" | "spine";

export interface BookCoverProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  title: string;
  author?: string;
  size?: BookCoverSize;
  effect?: BookCoverEffect;
  hue?: string;
}

const sizeMap: Record<BookCoverSize, string> = {
  sm: "w-20 h-28",
  md: "w-32 h-44",
  lg: "w-44 h-60",
  xl: "w-56 h-80",
};

/**
 * 책 표지 — 단독 시각 또는 BookCard 내부에서 사용.
 * @example
 * <BookCover src="/cover.jpg" title="모비 딕" size="lg" effect="tilt" />
 * <BookCover title="에세이" author="저자" hue="from-purple-500 to-fuchsia-500" effect="spine" />
 * @status stable
 * @since 2.4.0
 * @tags book, media
 */
export const BookCover = forwardRef<HTMLDivElement, BookCoverProps>(
  ({ src, title, author, size = "md", effect = "flat", hue, className, style, ...props }, ref) => {
    const tiltClass = effect === "tilt" ? "transition-transform duration-300 hover:-rotate-2 hover:-translate-y-1" : "";
    const spineDecor = effect === "spine" ? (
      <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/15 rounded-l-md" />
    ) : null;
    return (
      <div
        ref={ref}
        className={cn("relative rounded-md overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.18)]", sizeMap[size], tiltClass, className)}
        style={style}
        {...props}
      >
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={cn("w-full h-full flex flex-col justify-end p-3 text-white bg-gradient-to-br", hue ?? "from-slate-700 to-slate-900")}>
            <p className="text-xs font-bold leading-tight line-clamp-3">{title}</p>
            {author && <p className="text-[10px] opacity-80 mt-1">{author}</p>}
          </div>
        )}
        {spineDecor}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>
    );
  },
);
BookCover.displayName = "BookCover";
