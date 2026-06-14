"use client";

import { useRef, useState } from "react";

interface Series {
  name: string;
  color: string;
  data: number[];
}

interface MultiLineChartProps {
  series: Series[];
  width?: number;
  height?: number;
  /** When true, normalize each series so first point = 100 */
  normalize?: boolean;
  unit?: string;
  /** Optional labels per data index (e.g. dates). */
  labels?: string[];
  /** Show the inline legend below the chart. */
  showLegend?: boolean;
}

export function MultiLineChart({
  series,
  width = 380,
  height = 220,
  normalize = true,
  unit = "%",
  labels,
  showLegend = true,
}: MultiLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (series.length === 0) return null;
  const padL = 42;
  const padR = 14;
  const padT = 12;
  const padB = showLegend ? 24 : 22;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const transformed = series.map((s) => {
    if (!normalize || s.data.length === 0) return s;
    const base = s.data[0];
    if (!base) return s;
    return {
      ...s,
      data: s.data.map((v) => ((v - base) / base) * 100),
    };
  });

  let min = Infinity;
  let max = -Infinity;
  for (const s of transformed) {
    for (const v of s.data) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const padPad = (max - min) * 0.1 || 1;
  min -= padPad;
  max += padPad;
  const range = max - min;
  const longest = Math.max(...transformed.map((s) => s.data.length));
  const stepX = innerW / Math.max(1, longest - 1);
  const yOf = (v: number) => padT + ((max - v) / range) * innerH;
  const xOf = (i: number) => padL + i * stepX;

  const ticks: number[] = [];
  const step = niceStep(range / 4);
  let t = Math.ceil(min / step) * step;
  while (t < max) {
    ticks.push(t);
    t += step;
  }

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const x = xRatio * width;
    const idx = Math.max(0, Math.min(longest - 1, Math.round((x - padL) / stepX)));
    setHoverIdx(idx);
  }

  const hoverX = hoverIdx != null ? xOf(hoverIdx) : null;

  // Tooltip layout
  const tipPadX = 8;
  const tipLineH = 14;
  const tipNamesMaxLen = Math.max(2, ...transformed.map((s) => s.name.length));
  const tipW = Math.min(180, 60 + tipNamesMaxLen * 6);
  const tipH = (transformed.length + (labels?.[hoverIdx ?? 0] ? 1 : 0)) * tipLineH + 12;
  const tipX =
    hoverX != null
      ? Math.min(width - tipW - 4, Math.max(4, hoverX + 10))
      : 0;
  const tipY = 6;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="bm-num"
      style={{ display: "block", maxWidth: "100%" }}
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIdx(null)}
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
            {tv >= 0 ? "+" : ""}
            {tv.toFixed(0)}
            {unit}
          </text>
        </g>
      ))}
      <line
        x1={padL}
        x2={width - padR}
        y1={yOf(0)}
        y2={yOf(0)}
        stroke="var(--bm-axis)"
        strokeDasharray="3 3"
      />

      {transformed.map((s) => {
        const pts = s.data
          .map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`)
          .join(" L");
        const lastV = s.data[s.data.length - 1];
        return (
          <g key={s.name}>
            <path
              d={`M${pts}`}
              fill="none"
              stroke={s.color}
              strokeWidth={1.9}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              cx={xOf(s.data.length - 1)}
              cy={yOf(lastV)}
              r={3.5}
              fill={s.color}
              stroke="white"
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      {/* Hover crosshair + dots */}
      {hoverX != null && hoverIdx != null ? (
        <g pointerEvents="none">
          <line
            x1={hoverX}
            x2={hoverX}
            y1={padT}
            y2={padT + innerH}
            stroke="var(--bm-axis)"
            strokeOpacity={0.5}
            strokeDasharray="3 3"
          />
          {transformed.map((s) => {
            const v = s.data[hoverIdx];
            if (v == null) return null;
            return (
              <circle
                key={`d-${s.name}`}
                cx={hoverX}
                cy={yOf(v)}
                r={3.5}
                fill={s.color}
                stroke="white"
                strokeWidth={1.5}
              />
            );
          })}
          <g transform={`translate(${tipX}, ${tipY})`}>
            <rect
              width={tipW}
              height={tipH}
              rx={8}
              fill="var(--bm-card-elev)"
              stroke="var(--bm-border)"
            />
            {labels?.[hoverIdx] ? (
              <text
                x={tipPadX}
                y={tipLineH - 1}
                fontSize={10}
                fontWeight={700}
                fill="var(--bm-text)"
              >
                {labels[hoverIdx]}
              </text>
            ) : null}
            {transformed.map((s, i) => {
              const v = s.data[hoverIdx];
              const yPos = (labels?.[hoverIdx] ? tipLineH : 0) + (i + 1) * tipLineH;
              return (
                <g key={`t-${s.name}`}>
                  <circle cx={tipPadX + 4} cy={yPos - 4} r={3} fill={s.color} />
                  <text
                    x={tipPadX + 12}
                    y={yPos}
                    fontSize={11}
                    fontWeight={600}
                    fill="var(--bm-text)"
                  >
                    {s.name}
                  </text>
                  <text
                    x={tipW - tipPadX}
                    y={yPos}
                    fontSize={11}
                    fontWeight={800}
                    fill="white"
                    textAnchor="end"
                  >
                    {v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}${unit}`}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      ) : null}

      {/* Inline legend */}
      {showLegend ? (
        <g transform={`translate(${padL}, ${height - 4})`}>
          {transformed.map((s, i) => {
            // Naive horizontal layout
            const x = i * 90;
            return (
              <g key={`lg-${s.name}`} transform={`translate(${x}, 0)`}>
                <rect width={10} height={3} y={-7} rx={1.5} fill={s.color} />
                <text x={14} y={-4} fontSize={10} fontWeight={700} fill="var(--bm-axis)">
                  {s.name}
                </text>
              </g>
            );
          })}
        </g>
      ) : null}
    </svg>
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
