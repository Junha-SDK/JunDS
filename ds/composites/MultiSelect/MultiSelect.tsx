"use client";
import { useState, useRef } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Tag } from "../../primitives/Tag";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxDisplay?: number;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

/**
 * 다중 선택 컴포넌트
 * @example
 * <MultiSelect options={opts} value={selected} onChange={setSelected} searchable />
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  searchable,
  maxDisplay = 3,
  disabled,
  error,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (val: string) => {
    onChange(
      value.includes(val)
        ? value.filter((v) => v !== val)
        : [...value, val],
    );
  };

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean);

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex items-center gap-1 flex-wrap min-h-[36px] w-full border bg-white px-2 py-1 rounded-lg transition-all duration-150",
          "focus:outline-none cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error ? "border-danger" : open ? "border-primary shadow-[0_0_0_3px_var(--primary-glow)]" : "border-border",
        )}
      >
        {selectedLabels.length === 0 && (
          <span className="text-sm text-muted-light px-1">{placeholder}</span>
        )}
        {selectedLabels.slice(0, maxDisplay).map((opt) => (
          <Tag
            key={opt!.value}
            color="primary"
            closable
            onClose={() => toggle(opt!.value)}
          >
            {opt!.label}
          </Tag>
        ))}
        {selectedLabels.length > maxDisplay && (
          <Tag color="gray">+{selectedLabels.length - maxDisplay}</Tag>
        )}
        <svg
          className={cn("w-4 h-4 text-muted ml-auto shrink-0 transition-transform", open && "rotate-180")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-auto py-1 animate-fade-in-scale">
          {searchable && (
            <div className="px-2 py-1.5 sticky top-0 bg-white border-b border-border-light">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="검색..."
                className="w-full px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
          )}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-light text-center">결과 없음</div>
          )}
          {filtered.map((opt) => {
            const checked = value.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                  checked && "bg-primary-light/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  className="accent-primary w-3.5 h-3.5 rounded"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
