"use client";
import { useState, useEffect, useRef, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounce?: number;
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 text-xs px-2.5",
  md: "h-9 text-sm px-3",
  lg: "h-11 text-base px-4",
};

/**
 * 검색 입력 컴포넌트
 * @example
 * <SearchInput value={query} onChange={setQuery} onSearch={handleSearch} placeholder="검색..." />
 */
export const SearchInput = forwardRef<HTMLDivElement, SearchInputProps>(
  ({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = "검색...",
  debounce = 300,
  loading,
  disabled,
  size = "md",
  className,
}, ref) => {
  const [internal, setInternal] = useState(controlledValue ?? "");
  const value = controlledValue ?? internal;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (controlledValue !== undefined) setInternal(controlledValue);
  }, [controlledValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInternal(v);
    onChange?.(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch?.(v), debounce);
  };

  const handleClear = () => {
    setInternal("");
    onChange?.("");
    onSearch?.("");
  };

  return (
    <div ref={ref} className={cn("relative flex items-center", className)}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute left-3 text-muted pointer-events-none" aria-hidden="true">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full border rounded-lg bg-white pl-9 pr-8 transition-all duration-150",
          "placeholder:text-muted outline-none",
          "focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "border-border",
          "[&::-webkit-search-cancel-button]:hidden",
          sizeStyles[size],
        )}
        role="searchbox"
      />
      {loading && (
        <svg className="absolute right-3 animate-spin text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && value && (
        <button type="button" onClick={handleClear} className="absolute right-2 p-1 text-muted hover:text-foreground transition-colors cursor-pointer" aria-label="검색어 지우기">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      )}
    </div>
  );
},
);
SearchInput.displayName = "SearchInput";
