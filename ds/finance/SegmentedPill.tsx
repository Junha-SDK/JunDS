"use client";

import type { ReactNode } from "react";

export interface SegmentOption {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
  disabled?: boolean;
}

export interface SegmentedPillProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<SegmentedPillProps["size"]>, string> = {
  sm: "px-3 py-1 text-[11.5px]",
  md: "px-4 py-1.5 text-[13px]",
  lg: "px-5 py-2 text-[14px]",
};

export function SegmentedPill({
  options,
  value,
  onChange,
  size = "md",
  fullWidth = false,
  className,
}: SegmentedPillProps) {
  return (
    <div
      role="tablist"
      className={[
        // max-w-full + overflow-x-auto: 탭 폭 합이 부모보다 크면(좁은 모바일) 페이지를
        // 밀어내는 대신 내부에서 가로 스크롤. 데스크톱(탭이 다 들어감)에선 무변화.
        "relative inline-flex items-center rounded-full p-1 max-w-full overflow-x-auto",
        fullWidth ? "w-full" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: "var(--bm-soft-100)",
        border: "1px solid var(--bm-border)",
      }}
    >
      {options.map((option) => {
        const selected = value === option.key;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={option.disabled}
            onClick={() => !option.disabled && onChange(option.key)}
            className={[
              "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              fullWidth ? "flex-1" : "",
              sizeClasses[size],
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              color: selected ? "var(--bm-accent-ink)" : "var(--bm-muted)",
              background: selected ? "var(--bm-card)" : "transparent",
              boxShadow: selected ? "var(--bm-shadow-sm)" : "none",
            }}
          >
            {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
            {option.label}
            {option.badge !== undefined && option.badge > 0 ? (
              <span
                className="bm-num inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10.5px] font-extrabold"
                style={{
                  // on-accent: accent 는 다크모드 화이트 — 선택된 배지의 #fff 가 사라진다 (라이트 동일).
                  background: selected ? "var(--bm-accent)" : "var(--bm-soft-200)",
                  color: selected ? "var(--bm-on-accent)" : "var(--bm-muted)",
                }}
              >
                {option.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
