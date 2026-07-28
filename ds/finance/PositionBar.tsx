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
        // rgba(239,68,68)/rgba(37,99,235) 는 바로 아래 줄이 쓰는 --bm-up/--bm-down 을
        // 손으로 베낀 값이다 — 같은 토큰에서 섞어야 테마가 바뀌어도 두 층이 함께 움직인다
        style={{
          left: `${left}%`,
          width: `${right - left}%`,
          background: `color-mix(in srgb, ${color} 18%, transparent)`,
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
        // #0f172a 는 라이트 전용 잉크라 다크 배경에서 눈금이 사라진다
        style={{ left: "50%", background: "var(--bm-text)" }}
      />
    </div>
  );
}
