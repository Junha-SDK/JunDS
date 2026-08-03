"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface FormArrayProps<T> {
  /** 항목 배열 값 */
  value: T[];
  /** 값 변경 콜백 */
  onChange: (value: T[]) => void;
  /** 항목 렌더 함수 */
  renderItem: (
    item: T,
    index: number,
    helpers: { remove: () => void; update: (val: T) => void },
  ) => ReactNode;
  /** 새 항목 기본값 */
  defaultItem: T;
  /** 최대 항목 수 */
  maxItems?: number;
  /** 최소 항목 수 */
  minItems?: number;
  /** 추가 버튼 라벨 */
  addLabel?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 배열형 폼 필드(추가/삭제 가능한 반복 항목)를 관리합니다.
 * @example
 * <FormArray
 *   value={items}
 *   onChange={setItems}
 *   defaultItem={{ name: "" }}
 *   renderItem={(item, idx) => <Input value={item.name} />}
 * />
 * @status stable
 * @since 2.2.0
 * @tags form
 */
export function FormArray<T>({
  value,
  onChange,
  renderItem,
  defaultItem,
  maxItems,
  minItems = 0,
  addLabel = "항목 추가",
  className,
}: FormArrayProps<T>) {
  const add = () => {
    if (maxItems && value.length >= maxItems) return;
    onChange([...value, structuredClone(defaultItem)]);
  };

  const remove = (index: number) => {
    if (value.length <= minItems) return;
    onChange(value.filter((_, i) => i !== index));
  };

  const update = (index: number, val: T) => {
    onChange(value.map((item, i) => (i === index ? val : item)));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {value.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1">
            {renderItem(item, i, { remove: () => remove(i), update: (v) => update(i, v) })}
          </div>
          {value.length > minItems && (
            <button
              type="button"
              onClick={() => remove(i)}
              className={cn(
                "shrink-0 p-2 mt-1 rounded-lg cursor-pointer transition-colors",
                "text-muted hover:text-danger hover:bg-danger-light active:bg-danger/15",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
              aria-label="항목 삭제"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3.5 3.5l7 7M10.5 3.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
      {(!maxItems || value.length < maxItems) && (
        <button
          type="button"
          onClick={add}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl cursor-pointer transition-colors",
            "text-primary-ink border border-dashed border-primary/30",
            "hover:bg-primary/5 hover:border-primary/50 active:bg-primary/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {addLabel}
        </button>
      )}
    </div>
  );
}
