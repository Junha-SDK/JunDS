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
  /** 선택 옵션 목록 */
  options: ComboboxOption[];
  /** 선택된 값 */
  value?: string;
  /** 값 변경 콜백 */
  onChange?: (value: string) => void;
  /** 입력 변경 콜백 (async 검색용) */
  onInputChange?: (query: string) => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 새 값 생성 허용 */
  creatable?: boolean;
  /** 새 값 생성 라벨 */
  onCreateLabel?: string;
  /** 비동기 로딩 */
  loading?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 결과 없을 때 메시지 */
  emptyMessage?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 콤보박스 (자동완성 + 셀렉트 + 생성)
 * @example
 * <Combobox options={users} value={v} onChange={setV} creatable placeholder="사용자 검색..." />
 * @status stable
 * @since 2.2.0
 * @tags form, input
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

  const showCreate =
    creatable && query && !filtered.some((o) => o.label.toLowerCase() === query.toLowerCase());
  const allItems = showCreate
    ? [
        ...filtered,
        {
          value: query,
          label: `${onCreateLabel} "${query}"`,
          description: undefined,
          icon: undefined,
          disabled: false,
        },
      ]
    : filtered;

  const selected = options.find((o) => o.value === value);

  const handleSelect = (val: string) => {
    onChange?.(val);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, allItems.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && allItems[highlightIdx]) {
      e.preventDefault();
      if (!allItems[highlightIdx].disabled) handleSelect(allItems[highlightIdx].value);
    }
  };

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <div
        className={cn(
          // 변하는 것은 테두리색과 글로우 둘뿐이다 — transition-all 은 높이까지 물어 리플로우를 부른다
          "flex items-center gap-2 h-9 px-3 border bg-card rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 ease-out cursor-text",
          "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          error ? "border-danger" : "border-border hover:border-muted-light",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted shrink-0">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={open ? query : selected?.label || ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightIdx(0);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected ? selected.label : placeholder}
          disabled={disabled}
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-light min-w-0"
        />
        {loading && <Spinner size="xs" />}
      </div>

      {open && (
        // 떠 있는 목록은 그림자 한 겹으로는 배경에서 떨어지지 않는다 — 다층 그림자 + 얇은 링
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-border-light max-h-60 overflow-auto p-1 animate-fade-in-scale motion-reduce:animate-none">
          {allItems.length === 0 && !loading && (
            <div className="px-3 py-4 text-sm text-muted text-center">{emptyMessage}</div>
          )}
          {loading && allItems.length === 0 && (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          )}
          {allItems.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => !opt.disabled && handleSelect(opt.value)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                i === highlightIdx ? "bg-primary/10 text-primary-ink" : "hover:bg-card-hover",
                opt.value === value && "text-primary-ink font-medium",
                opt.disabled && "opacity-40 cursor-not-allowed",
              )}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <div className="flex-1 min-w-0">
                <div className="truncate">{opt.label}</div>
                {opt.description && (
                  <div className="text-xs text-muted truncate">{opt.description}</div>
                )}
              </div>
              {opt.value === value && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="shrink-0 text-primary-ink"
                >
                  <path
                    d="M3 7.5l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
