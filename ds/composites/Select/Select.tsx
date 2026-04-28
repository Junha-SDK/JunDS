"use client";
import { useState, useRef, useCallback, useEffect, forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";

/** 드롭다운 옵션 항목 정의 */
export interface SelectOption<T extends string = string> {
  /** 옵션의 고유 값. onChange 콜백에 전달됩니다. */
  value: T;
  /** 드롭다운 목록에 표시되는 텍스트 */
  label: string;
  /**
   * 옵션 라벨 왼쪽에 표시되는 아이콘.
   * 국기, 카테고리 아이콘 등을 표시할 때 사용합니다.
   *
   * @example icon={<FlagIcon />}
   */
  icon?: React.ReactNode;
  /**
   * 옵션 비활성화 여부.
   * true이면 선택할 수 없으며 흐리게 표시됩니다.
   *
   * @default false
   */
  disabled?: boolean;
}

/**
 * 드롭다운 선택 컴포넌트.
 *
 * 옵션 목록에서 하나를 선택합니다.
 * 검색, 비활성화, 에러 상태를 지원합니다.
 *
 * @example
 * <Select
 *   options={[{ value: "kr", label: "한국" }, { value: "us", label: "미국" }]}
 *   value={country}
 *   onChange={setCountry}
 *   placeholder="국가 선택"
 * />
 */
export interface SelectProps<T extends string = string> {
  /**
   * 선택 가능한 옵션 목록.
   * 각 옵션은 value와 label을 필수로 가집니다.
   */
  options: SelectOption<T>[];
  /**
   * 현재 선택된 값.
   * options 배열 내 하나의 value와 일치해야 합니다.
   * 미지정 시 placeholder가 표시됩니다.
   */
  value?: T;
  /**
   * 옵션이 선택될 때 호출되는 콜백.
   * 새로 선택된 옵션의 value가 인자로 전달됩니다.
   */
  onChange?: (value: T) => void;
  /**
   * 값이 선택되지 않았을 때 표시되는 안내 텍스트.
   *
   * @default "선택하세요"
   */
  placeholder?: string;
  /**
   * 컴포넌트 전체 비활성화 여부.
   * true이면 드롭다운을 열 수 없으며 흐리게 표시됩니다.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * 에러 상태 표시 여부.
   * true이면 테두리가 빨간색으로 변경되어 유효성 검사 실패를 나타냅니다.
   *
   * @default false
   */
  error?: boolean;
  /**
   * 셀렉트 크기.
   * - `"sm"` — 작은 크기 (32px). 밀집된 폼에 적합합니다.
   * - `"md"` — 기본 크기 (36px).
   * - `"lg"` — 큰 크기 (44px). 주요 입력 폼에 적합합니다.
   *
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 검색 기능 활성화 여부.
   * true이면 드롭다운 상단에 검색 입력 필드가 표시되어 옵션을 필터링할 수 있습니다.
   * 옵션이 많을 때 사용합니다.
   *
   * @default false
   */
  searchable?: boolean;
  /** 루트 요소에 추가할 CSS 클래스 */
  className?: string;
  /**
   * 전체 너비 사용 여부.
   * true이면 부모 컨테이너의 너비를 100% 차지합니다.
   *
   * @default false
   */
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: "h-8 px-2.5 text-xs rounded-md",
  md: "h-9 px-3 text-sm rounded-lg",
  lg: "h-11 px-4 text-base rounded-xl",
};

/**
 * 드롭다운 선택 컴포넌트.
 *
 * 옵션 목록에서 하나를 선택합니다.
 * 검색, 비활성화, 에러 상태를 지원합니다.
 *
 * @example
 * <Select
 *   options={[{ value: "kr", label: "한국" }, { value: "us", label: "미국" }]}
 *   value={country}
 *   onChange={setCountry}
 *   placeholder="국가 선택"
 * />
 */
function SelectInner<T extends string = string>({
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
  innerRef,
}: SelectProps<T> & { innerRef?: React.Ref<HTMLDivElement> }) {
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
    <div ref={(node) => {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof innerRef === "function") innerRef(node);
      else if (innerRef) (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }} className={cn("relative", fullWidth ? "w-full" : "w-fit", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center justify-between gap-2 w-full border bg-card transition-all duration-150",
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
            "absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-xl",
            /* Dropdown max height: 240px (15rem) — fits ~6 options comfortably */
            "max-h-60 overflow-auto py-1 animate-fade-in-scale",
          )}
          role="listbox"
        >
          {searchable && (
            <li className="px-2 py-1.5 sticky top-0 bg-card">
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

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (props, ref) => <SelectInner {...props} innerRef={ref} />,
) as <T extends string = string>(
  props: SelectProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;

(Select as { displayName?: string }).displayName = "Select";
