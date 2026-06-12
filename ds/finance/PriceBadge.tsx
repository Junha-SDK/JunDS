import { fmtSignedPct } from "./lib/format";

export function PriceBadge({
  pct,
  size = "md",
  showArrow = true,
  bold = true,
}: {
  pct: number;
  size?: "sm" | "md";
  showArrow?: boolean;
  bold?: boolean;
}) {
  const up = pct > 0;
  const flat = pct === 0;
  const color = up ? "var(--bm-up)" : flat ? "var(--bm-muted)" : "var(--bm-down)";
  const fs = size === "sm" ? 12 : 14;
  return (
    <span
      className="inline-flex items-center gap-[2px] bm-num"
      style={{ color, fontSize: fs, fontWeight: bold ? 700 : 500 }}
    >
      {showArrow && !flat ? (up ? "▲" : "▼") : null}
      {fmtSignedPct(pct)}
    </span>
  );
}

export function HotPctChip({ pct }: { pct: number }) {
  return (
    <span
      className="bm-pill bm-num"
      style={{
        background: "linear-gradient(180deg, #ff6f43 0%, #ef4444 100%)",
        color: "white",
        fontSize: 12,
        fontWeight: 800,
        padding: "4px 10px",
      }}
    >
      ↑ {pct.toFixed(2)}%
    </span>
  );
}
