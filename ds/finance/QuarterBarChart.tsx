"use client";

import type { QuarterRow } from "./lib/financials";

interface QuarterBarChartProps {
  data: QuarterRow[];
  width?: number;
  height?: number;
  /** Which two metrics to show as paired bars */
  metric?: "revenue-op" | "revenue-net";
}

export function QuarterBarChart({
  data,
  width = 380,
  height = 220,
  metric = "revenue-op",
}: QuarterBarChartProps) {
  const padL = 38;
  const padR = 8;
  const padT = 12;
  const padB = 26;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const slot = innerW / data.length;
  const barWidth = slot * 0.32;

  const aColor = "#5cdcd0";
  const bColor = metric === "revenue-op" ? "#0f766e" : "#a855f7";
  const aKey = "revenue" as const;
  const bKey = metric === "revenue-op" ? ("operatingIncome" as const) : ("netIncome" as const);
  const bLabel = metric === "revenue-op" ? "영업이익" : "순이익";

  const max = Math.max(...data.flatMap((d) => [d[aKey], d[bKey]]));
  const min = Math.min(0, ...data.flatMap((d) => [d[bKey]]));
  const range = max - min || 1;
  const yOf = (v: number) => padT + ((max - v) / range) * innerH;

  const ticks: number[] = [];
  const step = niceStep(range / 4);
  let t = Math.ceil(min / step) * step;
  while (t <= max) {
    ticks.push(t);
    t += step;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="bm-num"
      style={{ display: "block", maxWidth: "100%" }}
    >
      {ticks.map((tv) => (
        <g key={tv}>
          <line
            x1={padL}
            x2={width - padR}
            y1={yOf(tv)}
            y2={yOf(tv)}
            stroke="var(--bm-grid)"
          />
          <text
            x={padL - 6}
            y={yOf(tv) + 3}
            fontSize={10}
            fill="var(--bm-axis)"
            textAnchor="end"
          >
            {Math.round(tv).toLocaleString("ko-KR")}
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const cx = padL + i * slot + slot / 2;
        const y0 = yOf(0);
        const yA = yOf(d[aKey]);
        const yB = yOf(d[bKey]);
        return (
          <g key={d.label}>
            <rect
              x={cx - barWidth - 2}
              y={Math.min(yA, y0)}
              width={barWidth}
              height={Math.max(1, Math.abs(yA - y0))}
              fill={aColor}
              rx={2}
            />
            <rect
              x={cx + 2}
              y={Math.min(yB, y0)}
              width={barWidth}
              height={Math.max(1, Math.abs(yB - y0))}
              fill={bColor}
              rx={2}
            />
            <text
              x={cx}
              y={height - 8}
              fontSize={10}
              fill="var(--bm-axis)"
              textAnchor="middle"
              fontWeight={600}
            >
              {d.label}
            </text>
          </g>
        );
      })}

      <g transform={`translate(${padL}, ${padT - 4})`}>
        <Legend color={aColor} label="매출" x={0} />
        <Legend color={bColor} label={bLabel} x={56} />
      </g>
    </svg>
  );
}

function Legend({ color, label, x }: { color: string; label: string; x: number }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <rect x={0} y={-2} width={9} height={9} rx={2} fill={color} />
      <text x={13} y={6} fontSize={10} fontWeight={700} fill="var(--bm-text)">
        {label}
      </text>
    </g>
  );
}

function niceStep(raw: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(Math.max(0.001, raw))));
  const f = raw / exp;
  let nf: number;
  if (f < 1.5) nf = 1;
  else if (f < 3) nf = 2;
  else if (f < 7) nf = 5;
  else nf = 10;
  return nf * exp;
}
