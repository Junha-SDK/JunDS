"use client";

import { cn } from "../utils/cn";
import { useWatchlist } from "./lib/watchlist";
import { AppIcon } from "./AppIcon";

interface StarButtonProps {
  name: string;
  size?: number;
  className?: string;
  onChange?: (next: boolean) => void;
}

export function StarButton({ name, size = 18, className, onChange }: StarButtonProps) {
  const { has, toggle, hydrated } = useWatchlist();
  const active = hydrated && has(name);
  return (
    <button
      type="button"
      aria-label={active ? "관심종목 제거" : "관심종목 추가"}
      aria-pressed={active}
      // 인라인 style 로 border:none 만 주고 outline 을 방치하면 브라우저 기본 링이
      // 아이콘을 네모로 가른다 — 형태에 맞는 둥근 링을 직접 준다
      className={cn(
        "rounded-full transition-transform duration-150 hover:scale-110 active:scale-95",
        "motion-reduce:transition-none motion-reduce:hover:scale-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bm-card)]",
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(name);
        onChange?.(!active);
      }}
      style={{
        background: "transparent",
        border: "none",
        padding: 4,
        cursor: "pointer",
        color: active ? "var(--bm-warning)" : "var(--bm-muted)",
        lineHeight: 0,
      }}
    >
      <AppIcon
        name="star"
        size={size}
        strokeWidth={2}
        color={active ? "var(--bm-warning)" : undefined}
      />
      {active ? (
        <span style={{ display: "none" }}>{/* fill via stroke-color trick handled below */}</span>
      ) : null}
    </button>
  );
}
