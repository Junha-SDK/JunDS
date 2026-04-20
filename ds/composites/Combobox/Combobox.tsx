"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useDebounce } from "../../hooks/useDebounce";
import { Spinner } from "../../primitives/Spinner";
import type { ReactNode } from "react";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** 입력 변경 콜백 (async 검색용) */
  onInputChange?: (query: string) => void;
  placeholder?: string;
  /** 새 값 생성 허용 */
  creatable?: boolean;
  onCreateLabel?: string;
  /** 비동기 로딩 */
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * 콤보박스 (자동완성 + 셀렉트 + 생성)
 * @example
 * <Combobox options={users} value={v} onChange={setV} creatable placeholder="사용자 검색..." />
 */
export function Combobox({
  options,
  value,
  onChange,
  onInputChange,
  placeholder = "검색...",
  creatable,
  onCreateLabel = "새로 만들기:",
  loading,
  disabled,
  error,
  emptyMessage = "결과 없음",
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 200);

  useClickOutside(ref, () => setOpen(false), open);

  useEffect(() => {
    onInputChange?.(debouncedQuery);
  }, [debouncedQuery, onInputChange]);

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const showCreate = creatable && query && !filtered.some((o) => o.label.toLowerCase() === query.toLowerCase());
  const allItems = showCreate ? [...filtered, { value: query, label: `${onCreateLabel} "${query}"`, description: undefined, icon: undefined, disabled: false }] : filtered;

  const selected = options.find((o) => o.value === value);

  const handleSelect = (val: string) => {
    onChange?.(val);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx((i) => Math.min(i + 1, allItems.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && allItems[highlightIdx]) {
      e.preventDefault();
      if (!allItems[highlightIdx].disabled) handleSelect(allItems[highlightIdx].value);
    }
  };

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex items-center gap-2 h-9 px-3 border bg-white rounded-lg transition-all duration-150 cursor-text",
          "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow)]",
          error ? "border-danger" : "border-border",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onClick={() => { if (!disabled) { setOpen(true); inputRef.current?.focus(); } }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted shrink-0">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={open ? query : (selected?.label || "")}
          onChange={(e) => { setQuery(e.target.value); setHighlightIdx(0); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected ? selected.label : placeholder}
          disabled={disabled}
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-light min-w-0"
        />
        {loading && <Spinner size="xs" />}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-auto py-1 animate-fade-in-scale">
          {allItems.length === 0 && !loading && (
            <div className="px-3 py-4 text-sm text-muted text-center">{emptyMessage}</div>
          )}
          {loading && allItems.length === 0 && (
            <div className="flex justify-center py-4"><Spinner size="sm" /></div>
          )}
          {allItems.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => !opt.disabled && handleSelect(opt.value)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer text-sm",
                i === highlightIdx && "bg-primary-light",
                opt.value === value && "text-primary font-medium",
                opt.disabled && "opacity-40 cursor-not-allowed",
                "hover:bg-gray-50",
              )}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <div className="flex-1 min-w-0">
                <div className="truncate">{opt.label}</div>
                {opt.description && <div className="text-xs text-muted truncate">{opt.description}</div>}
              </div>
              {opt.value === value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-primary">
                  <path d="M3 7.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
