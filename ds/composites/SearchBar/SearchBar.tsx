"use client";
import { forwardRef, useState, useRef, useEffect } from "react";
import { cn } from "../../utils/cn";
import { useDebounce } from "../../hooks/useDebounce";
import { useKeyboardShortcut } from "../../hooks/useKeyboardShortcut";
import type { ReactNode } from "react";

export interface SearchBarProps {
  /** 입력값 (controlled) */
  value?: string;
  /** 초기값 (uncontrolled) */
  defaultValue?: string;
  /** 입력 변경 (즉시) */
  onChange?: (value: string) => void;
  /** 디바운스된 변경 콜백 (실 검색 호출에 사용) */
  onSearch?: (value: string) => void;
  /** 디바운스 ms (기본 250) */
  debounceMs?: number;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 단축키로 포커스 이동 (예: "mod+k", false면 비활성) */
  focusShortcut?: string | false;
  /** 우측 슬롯 (단축키 힌트 등) */
  endSlot?: ReactNode;
  /** 크기 */
  size?: "sm" | "md" | "lg";
  /** disabled */
  disabled?: boolean;
  /** 추가 클래스 */
  className?: string;
}

const sizeClass = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
} as const;

/**
 * 검색 입력 — 디바운스 + 단축키 포커스 + 클리어 버튼.
 *
 * @example
 *   <SearchBar
 *     focusShortcut="mod+k"
 *     onSearch={(q) => setQuery(q)}
 *     endSlot={<><KeyCap>⌘</KeyCap><KeyCap>K</KeyCap></>}
 *   />
 *
 * @status stable
 * @since 2.5.0
 * @tags form, input
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      onSearch,
      debounceMs = 250,
      placeholder = "검색",
      focusShortcut = "mod+k",
      endSlot,
      size = "md",
      disabled,
      className,
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue ?? "");
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internal;
    const inputRef = useRef<HTMLInputElement>(null);

    // forward ref
    useEffect(() => {
      if (typeof ref === "function") ref(inputRef.current);
      else if (ref)
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
    }, [ref]);

    const debounced = useDebounce(value, debounceMs);
    useEffect(() => {
      onSearch?.(debounced);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced]);

    useKeyboardShortcut(focusShortcut || "noop+nothing", () => inputRef.current?.focus(), {
      enabled: !!focusShortcut,
      allowInInputs: true,
    });

    const setValue = (v: string) => {
      if (!isControlled) setInternal(v);
      onChange?.(v);
    };

    return (
      <div
        className={cn(
          // 글로우는 box-shadow 라서 transition-colors 로는 전이되지 않는다 — 둘 다 지목한다
          "relative flex items-center w-full rounded-xl border border-border bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]",
          "transition-[border-color,box-shadow] duration-150",
          "hover:border-muted-light",
          "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow)]",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <span className="pl-3 pr-1 text-muted shrink-0" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={placeholder}
          className={cn(
            "flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-light text-foreground",
            "px-1",
            sizeClass[size],
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="지우기"
            className="mx-1 px-1.5 py-0.5 rounded-md text-muted transition-colors hover:text-foreground hover:bg-surface-soft active:bg-border-light cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
          >
            ✕
          </button>
        )}
        {endSlot && <span className="pr-2 flex items-center gap-1 shrink-0">{endSlot}</span>}
      </div>
    );
  },
);
SearchBar.displayName = "SearchBar";
