"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface PhotoFilter {
  id: string;
  label: string;
  /** CSS filter 표현식 (예: "grayscale(1)") */
  filter: string;
}

export interface PhotoFiltersProps {
  /** 미리보기 이미지 (썸네일) */
  previewSrc: string;
  /** 필터 목록 */
  filters: PhotoFilter[];
  /** 활성 필터 id */
  activeId?: string;
  /** 변경 콜백 */
  onChange: (id: string) => void;
  /** 추가 클래스 */
  className?: string;
}

export const defaultPhotoFilters: PhotoFilter[] = [
  { id: "none", label: "원본", filter: "none" },
  { id: "vivid", label: "선명", filter: "saturate(1.4) contrast(1.1)" },
  { id: "warm", label: "따뜻", filter: "sepia(0.2) saturate(1.2) hue-rotate(-10deg)" },
  { id: "cool", label: "차가움", filter: "hue-rotate(15deg) saturate(0.9)" },
  { id: "noir", label: "흑백", filter: "grayscale(1) contrast(1.15)" },
  { id: "fade", label: "페이드", filter: "saturate(0.7) brightness(1.05) contrast(0.95)" },
  { id: "vintage", label: "빈티지", filter: "sepia(0.5) saturate(1.1) brightness(0.95)" },
];

/**
 * 사진 필터 스트립 — 썸네일 미리보기 + 라벨, 가로 스크롤.
 * @example
 * <PhotoFilters previewSrc={src} filters={defaultPhotoFilters} activeId={f} onChange={setF} />
 * @status stable
 * @since 2.4.0
 * @tags photo, control
 */
export const PhotoFilters = forwardRef<HTMLDivElement, PhotoFiltersProps>(
  ({ previewSrc, filters, activeId, onChange, className }, ref) => (
    <div
      ref={ref}
      role="radiogroup"
      aria-label="사진 필터 선택"
      // 가로 스크롤이 끝에 닿았을 때 페이지까지 끌려가지 않게 한다
      className={cn(
        "flex gap-2 overflow-x-auto overscroll-x-contain py-2 -mx-2 px-2 snap-x",
        className,
      )}
    >
      {filters.map((f) => {
        const active = f.id === activeId;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(f.id)}
            className={cn(
              // 변하는 것은 배경색과 글자색뿐 — transition-all 은 패딩까지 물어 리플로우를 부른다
              "shrink-0 snap-start flex flex-col items-center gap-1 rounded-lg p-1.5 transition-colors duration-150 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active ? "bg-primary/10 text-primary-ink" : "hover:bg-surface-soft text-foreground",
            )}
          >
            <div
              className={cn(
                "w-14 h-14 rounded-md overflow-hidden border-2 transition-colors duration-150",
                active ? "border-primary" : "border-transparent",
              )}
            >
              <img
                src={previewSrc}
                alt=""
                className="w-full h-full object-cover"
                style={{ filter: f.filter }}
              />
            </div>
            <span className="text-[11px] font-medium">{f.label}</span>
          </button>
        );
      })}
    </div>
  ),
);
PhotoFilters.displayName = "PhotoFilters";
