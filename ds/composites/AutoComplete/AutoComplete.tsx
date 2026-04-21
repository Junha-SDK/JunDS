"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Portal } from "../../primitives/Portal";
import { Spinner } from "../../primitives/Spinner";

export interface AutoCompleteOption {
  key: string;
  label: string;
  /** 추가 설명 */
  description?: string;
}

export interface AutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  /** 자동완성 옵션 목록 */
  options: AutoCompleteOption[];
  /** 옵션 선택 콜백 */
  onSelect?: (option: AutoCompleteOption) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 비동기 로딩 상태 */
  loading?: boolean;
  /** 결과 없을 때 메시지 */
  emptyMessage?: string;
  className?: string;
}

/**
 * 자동완성 입력
 * @example
 * <AutoComplete value={v} onChange={setV} options={options} onSelect={handleSelect} placeholder="검색..." />
 */
export function AutoComplete({
  value,
  onChange,
  options,
  onSelect,
  placeholder = "입력하세요...",
  disabled,
  loading,
  emptyMessage = "결과 없음",
  className,
}: AutoCompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  const filtered = useMemo(() => {
    if (!value) return options;
    const q = value.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
    );
  }, [options, value]);

  const updatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const dropdownHeight = 240;
      const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
      setPos({
        top: clamp(rect.bottom + 4, 8, window.innerHeight - dropdownHeight - 8),
        left: clamp(rect.left, 8, window.innerWidth - rect.width - 8),
        width: rect.width,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setHighlightIdx(0);
    if (!open) {
      updatePosition();
      setOpen(true);
    }
  };

  const handleSelect = (opt: AutoCompleteOption) => {
    onChange(opt.label);
    onSelect?.(opt);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      updatePosition();
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && open && filtered[highlightIdx]) {
      e.preventDefault();
      handleSelect(filtered[highlightIdx]);
    }
  };

  const handleFocus = () => {
    updatePosition();
    setOpen(true);
  };

  useEffect(() => {
    setHighlightIdx(0);
  }, [filtered]);

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex items-center gap-2 h-9 px-3 border bg-card rounded-lg transition-all duration-150",
          "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-glow)]",
          disabled && "opacity-50 cursor-not-allowed",
          "border-border",
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted shrink-0">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-light min-w-0"
        />
        {loading && <Spinner size="xs" />}
      </div>

      {open && (
        <Portal>
          <div
            ref={ref}
            className="fixed z-50 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto py-1 animate-fade-in-scale"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {filtered.length === 0 && !loading && (
              <div className="px-3 py-4 text-sm text-muted text-center">{emptyMessage}</div>
            )}
            {loading && filtered.length === 0 && (
              <div className="flex justify-center py-4"><Spinner size="sm" /></div>
            )}
            {filtered.map((opt, i) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSelect(opt)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer text-sm",
                  i === highlightIdx && "bg-primary-light",
                  "hover:bg-primary/10",
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="truncate">{opt.label}</div>
                  {opt.description && <div className="text-xs text-muted truncate">{opt.description}</div>}
                </div>
              </button>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
}
