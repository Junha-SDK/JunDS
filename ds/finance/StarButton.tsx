"use client";

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
      className={className}
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
        color: active ? "#facc15" : "var(--bm-muted)",
        lineHeight: 0,
      }}
    >
      <AppIcon
        name="star"
        size={size}
        strokeWidth={2}
        color={active ? "#facc15" : undefined}
      />
      {active ? (
        <span style={{ display: "none" }}>
          {/* fill via stroke-color trick handled below */}
        </span>
      ) : null}
    </button>
  );
}
