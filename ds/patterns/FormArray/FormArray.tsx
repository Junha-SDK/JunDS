"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface FormArrayProps<T> {
  value: T[];
  onChange: (value: T[]) => void;
  renderItem: (item: T, index: number, helpers: { remove: () => void; update: (val: T) => void }) => ReactNode;
  defaultItem: T;
  maxItems?: number;
  minItems?: number;
  addLabel?: string;
  className?: string;
}

export function FormArray<T>({
  value, onChange, renderItem, defaultItem, maxItems, minItems = 0, addLabel = "항목 추가", className,
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
    onChange(value.map((item, i) => i === index ? val : item));
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
              className="shrink-0 p-2 text-muted hover:text-danger transition-colors cursor-pointer mt-1"
              aria-label="항목 삭제"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      ))}
      {(!maxItems || value.length < maxItems) && (
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-primary border border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          {addLabel}
        </button>
      )}
    </div>
  );
}
