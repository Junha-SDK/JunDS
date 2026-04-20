"use client";
import { useRef, useState, useEffect } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface SegmentOption {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-1.5 text-sm",
  lg: "px-5 py-2 text-base",
};

/**
 * 세그먼티드 컨트롤 — iOS 스타일 버튼 그룹 탭 선택기
 * @example
 * <SegmentedControl
 *   options={[{key:"list",label:"목록"},{key:"grid",label:"그리드"}]}
 *   value={view}
 *   onChange={setView}
 * />
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  size = "md",
  fullWidth = false,
  className,
}: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const idx = options.findIndex((o) => o.key === value);
    if (idx < 0) return;
    const buttons = container.querySelectorAll<HTMLButtonElement>("[data-segment-btn]");
    const btn = buttons[idx];
    if (!btn) return;
    setIndicatorStyle({
      left: btn.offsetLeft,
      width: btn.offsetWidth,
    });
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex bg-gray-100 rounded-lg p-1 gap-0.5",
        fullWidth && "w-full",
        className,
      )}
    >
      {/* 슬라이딩 인디케이터 */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-200 ease-out"
        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
      />
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          data-segment-btn=""
          disabled={option.disabled}
          onClick={() => !option.disabled && onChange(option.key)}
          className={cn(
            "relative z-10 inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors duration-150 cursor-pointer",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            sizeClasses[size],
            fullWidth && "flex-1",
            value === option.key ? "text-foreground" : "text-muted hover:text-foreground",
          )}
        >
          {option.icon && <span className="shrink-0">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}
