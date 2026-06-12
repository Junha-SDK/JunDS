interface PositionBarProps {
  low: number;
  high: number;
  cur: number;
  tone?: "up" | "down";
}

export function PositionBar({ low, high, cur, tone = "up" }: PositionBarProps) {
  const left = Math.max(0, Math.min(100, low * 100));
  const right = Math.max(0, Math.min(100, high * 100));
  const pos = Math.max(0, Math.min(100, cur * 100));
  const color = tone === "up" ? "var(--bm-up)" : "var(--bm-down)";

  return (
    <div className="relative h-2 rounded-full bg-[color:var(--bm-soft-100)] overflow-visible">
      <div
        className="absolute top-0 h-full rounded-full"
        style={{
          left: `${left}%`,
          width: `${right - left}%`,
          background: tone === "up" ? "rgba(239,68,68,0.18)" : "rgba(37,99,235,0.18)",
        }}
      />
      <div
        className="absolute top-0 h-full rounded-full"
        style={{
          left: `${left}%`,
          width: `${pos - left}%`,
          background: color,
        }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-[2px] h-3 rounded"
        style={{ left: "50%", background: "#0f172a" }}
      />
    </div>
  );
}
