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
  /** 선택 옵션 목록 */
  options: MultiSelectOption[];
  /** 선택된 값 목록 */
  value: string[];
  /** 값 변경 콜백 */
  onChange: (value: string[]) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 검색 입력 표시 여부 */
  searchable?: boolean;
  /** 한 번에 표시할 최대 태그 수 */
  maxDisplay?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 오류 상태 표시 */
  error?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 다중 선택 컴포넌트
 * @example
 * <MultiSelect options={opts} value={selected} onChange={setSelected} searchable />
 * @status stable
 * @since 2.2.0
 * @tags form, input
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
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={cn(
          "flex items-center gap-1 flex-wrap min-h-[38px] w-full border bg-white px-2 py-1 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out",
          "focus:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)] cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          error
            ? "border-danger"
            : open
              ? "border-primary shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]"
              : "border-border hover:border-gray-300",
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
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-xl max-h-60 overflow-auto py-1 animate-fade-in-scale">
          {searchable && (
            <div className="px-2 py-1.5 sticky top-0 bg-white border-b border-border-light">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="검색..."
                className="w-full px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
                // eslint-disable-next-line jsx-a11y/no-autofocus -- popup search input: focusing on open is the expected pattern (focus already inside the popup)
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
                  "flex items-center gap-2 mx-1 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors",
                  checked ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-50",
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
