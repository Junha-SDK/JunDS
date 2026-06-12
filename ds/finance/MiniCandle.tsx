import { seedCandles } from "./lib/mock";

export function MiniCandle({
  seed,
  width = 36,
  height = 22,
  tone,
}: {
  seed: number;
  width?: number;
  height?: number;
  tone?: "up" | "down" | "flat";
}) {
  const candles = seedCandles(seed, 8, 100, 0.04);
  const min = Math.min(...candles.map((c) => c.l));
  const max = Math.max(...candles.map((c) => c.h));
  const range = max - min || 1;
  const slot = width / candles.length;
  const upColor = "#ef4444";
  const downColor = "#3b82f6";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {candles.map((c, i) => {
        const cx = i * slot + slot / 2;
        const yh = ((max - c.h) / range) * (height - 2) + 1;
        const yl = ((max - c.l) / range) * (height - 2) + 1;
        const yo = ((max - c.o) / range) * (height - 2) + 1;
        const yc = ((max - c.c) / range) * (height - 2) + 1;
        const isUp = c.c >= c.o;
        const color =
          tone === "down" ? downColor : tone === "up" ? upColor : isUp ? upColor : downColor;
        const top = Math.min(yo, yc);
        const bot = Math.max(yo, yc);
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={yh} y2={yl} stroke={color} strokeWidth={1} />
            <rect
              x={cx - slot * 0.32}
              y={top}
              width={slot * 0.64}
              height={Math.max(1, bot - top)}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}
