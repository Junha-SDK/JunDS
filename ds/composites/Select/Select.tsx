"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string> {
  options: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: "sm" | "md" | "lg";
  searchable?: boolean;
  className?: string;
  /** 전체 너비 */
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: "h-8 px-2.5 text-xs rounded-md",
  md: "h-9 px-3 text-sm rounded-lg",
  lg: "h-11 px-4 text-base rounded-xl",
};

/**
 * 드롭다운 셀렉트
 * @example
 * <Select options={[{value:"a",label:"옵션A"}]} value={v} onChange={setV} />
 */
export function Select<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  disabled,
  error,
  size = "md",
  searchable,
  fullWidth,
  className,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  const selected = options.find((o) => o.value === value);
  const filtered = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = useCallback((val: T) => {
    onChange?.(val);
    setOpen(false);
    setSearch("");
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Enter" || e.key === " ") {
      if (!open) { setOpen(true); return; }
      if (highlightIdx >= 0 && filtered[highlightIdx] && !filtered[highlightIdx].disabled) {
        handleSelect(filtered[highlightIdx].value);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    }
  };

  useEffect(() => {
    if (!open) { setHighlightIdx(-1); setSearch(""); }
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", fullWidth ? "w-full" : "w-fit", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center justify-between gap-2 w-full border bg-white transition-all duration-150",
          "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
          "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          error ? "border-danger" : open ? "border-primary shadow-[0_0_0_3px_var(--primary-glow)]" : "border-border",
          sizeStyles[size],
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-light")}>
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.icon}{selected.label}
            </span>
          ) : placeholder}
        </span>
        <svg
          className={cn("w-4 h-4 text-muted shrink-0 transition-transform duration-200", open && "rotate-180")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          className={cn(
            "absolute z-50 mt-1 w-full bg-white border border-border rounded-lg shadow-xl",
            "max-h-60 overflow-auto py-1 animate-fade-in-scale",
          )}
          role="listbox"
        >
          {searchable && (
            <li className="px-2 py-1.5 sticky top-0 bg-white">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="검색..."
                className="w-full px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
                autoFocus
              />
            </li>
          )}
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-light text-center">결과 없음</li>
          )}
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => !opt.disabled && handleSelect(opt.value)}
              className={cn(
                "px-3 py-1.5 text-sm cursor-pointer flex items-center gap-2 transition-colors",
                opt.value === value && "bg-primary text-white font-medium",
                i === highlightIdx && "bg-primary/10",
                opt.disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary",
              )}
            >
              {opt.icon}
              {opt.label}
              {opt.value === value && (
                <svg className="w-4 h-4 ml-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
