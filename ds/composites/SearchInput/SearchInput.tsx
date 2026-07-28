"use client";
import { useState, useEffect, useRef, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface SearchInputProps {
  /** 입력 값 */
  value?: string;
  /** 값 변경 콜백 */
  onChange?: (value: string) => void;
  /** 검색 실행 콜백 (debounce 적용) */
  onSearch?: (value: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 디바운스 지연(ms) */
  debounce?: number;
  /** 로딩 상태 표시 */
  loading?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 입력 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 클래스 */
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
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export const SearchInput = forwardRef<HTMLDivElement, SearchInputProps>(
  (
    {
      value: controlledValue,
      onChange,
      onSearch,
      placeholder = "검색...",
      debounce = 300,
      loading,
      disabled,
      size = "md",
      className,
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(controlledValue ?? "");
    const value = controlledValue ?? internal;
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="absolute left-3 text-muted pointer-events-none"
          aria-hidden="true"
        >
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
            // all 은 height·padding 까지 전이 대상으로 잡는다 — 실제로 바뀌는 둘만 지목
            "w-full min-w-0 border rounded-xl bg-card pl-9 pr-8 transition-[border-color,box-shadow] duration-150",
            "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
            "placeholder:text-muted-light outline-none",
            "focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            // hover 는 두 모드 모두 대비가 올라가는 방향이어야 한다 — muted-light 가 그 자리다
            "border-border hover:border-muted-light",
            "[&::-webkit-search-cancel-button]:hidden",
            sizeStyles[size],
          )}
          role="searchbox"
        />
        {loading && (
          <svg
            className="absolute right-3 animate-spin motion-reduce:animate-none text-muted"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {!loading && value && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute right-2 p-1 rounded-lg text-muted cursor-pointer",
              "transition-colors duration-150 hover:text-foreground hover:bg-muted/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
            )}
            aria-label="검색어 지우기"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 3l6 6M9 3l-6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
