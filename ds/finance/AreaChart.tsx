"use client";

import { useId, useRef, useState } from "react";

interface AreaChartProps {
  data: number[];
  width?: number;
  height?: number;
  baseline?: number;
  /** Optional formatter for tooltip values. */
  formatValue?: (v: number) => string;
  /** Optional labels per data point (e.g. timestamps). */
  labels?: string[];
}

export function AreaChart({
  data,
  width = 380,
  height = 200,
  baseline,
  formatValue,
  labels,
}: AreaChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data.length) return null;
  const padL = 36;
  const padR = 12;
  const padT = 14;
  const padB = 24;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = innerW / Math.max(1, data.length - 1);
  const yOf = (v: number) => padT + ((max - v) / range) * innerH;
  const xOf = (i: number) => padL + i * stepX;

  const points = data.map((v, i) => ({ x: xOf(i), y: yOf(v) }));
  const linePath = `M${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L")}`;
  const baselineY = baseline != null ? yOf(baseline) : padT + innerH / 2;
  const last = data[data.length - 1];
  const tone = last > (baseline ?? data[0]) ? "up" : "down";
  const upColor = "var(--bm-up)";
  const downColor = "var(--bm-down)";
  const stroke = tone === "up" ? upColor : downColor;

  const top = padT;
  const bottom = padT + innerH;
  const fillTop = `${linePath} L${xOf(data.length - 1).toFixed(1)},${baselineY.toFixed(
    1,
  )} L${padL.toFixed(1)},${baselineY.toFixed(1)} Z`;
  const fillBottom = `${linePath} L${xOf(data.length - 1).toFixed(1)},${baselineY.toFixed(
    1,
  )} L${padL.toFixed(1)},${baselineY.toFixed(1)} Z`;

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
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((x - padL) / stepX)));
    setHoverIdx(idx);
  }

  const hp = hoverIdx != null ? points[hoverIdx] : null;
  const hv = hoverIdx != null ? data[hoverIdx] : null;
  const hLabel = hoverIdx != null ? labels?.[hoverIdx] : undefined;
  const fmt = formatValue ?? ((v: number) => v.toFixed(0));

  // Tooltip placement — flip to left side near the right edge
  const tipW = 86;
  const tipH = hLabel ? 38 : 24;
  const tipX = hp ? Math.min(width - tipW - 4, Math.max(4, hp.x + 8)) : 0;
  const tipY = hp ? Math.max(4, hp.y - tipH - 6) : 0;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", maxWidth: "100%" }}
      className="bm-num"
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <defs>
        <clipPath id={`ac-above-${uid}`}>
          <rect x={0} y={top} width={width} height={baselineY - top} />
        </clipPath>
        <clipPath id={`ac-below-${uid}`}>
          <rect x={0} y={baselineY} width={width} height={bottom - baselineY} />
        </clipPath>
        <linearGradient id={`ac-up-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={upColor} stopOpacity={0.42} />
          <stop offset="100%" stopColor={upColor} stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id={`ac-down-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={downColor} stopOpacity={0.02} />
          <stop offset="100%" stopColor={downColor} stopOpacity={0.42} />
        </linearGradient>
      </defs>

      {ticks.map((tv) => (
        <g key={tv}>
          <line x1={padL} x2={width - padR} y1={yOf(tv)} y2={yOf(tv)} stroke="var(--bm-grid)" />
          <text x={padL - 6} y={yOf(tv) + 3} fontSize={10} fill="var(--bm-axis)" textAnchor="end">
            {tv.toFixed(0)}
          </text>
        </g>
      ))}

      <line
        x1={padL}
        x2={width - padR}
        y1={baselineY}
        y2={baselineY}
        stroke="var(--bm-axis)"
        strokeDasharray="3 3"
      />

      <path d={fillBottom} fill={`url(#ac-down-${uid})`} clipPath={`url(#ac-below-${uid})`} />
      <path d={fillTop} fill={`url(#ac-up-${uid})`} clipPath={`url(#ac-above-${uid})`} />

      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Last-point marker */}
      {points.length > 0 ? (
        <g>
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={4.5}
            fill={stroke}
            fillOpacity={0.18}
          />
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={2.2}
            fill={stroke}
          />
        </g>
      ) : null}

      {/* Hover crosshair */}
      {hp && hv != null ? (
        <g pointerEvents="none">
          <line
            x1={hp.x}
            x2={hp.x}
            y1={padT}
            y2={bottom}
            stroke="var(--bm-axis)"
            strokeOpacity={0.5}
            strokeDasharray="3 3"
          />
          <circle cx={hp.x} cy={hp.y} r={3.5} fill={stroke} stroke="white" strokeWidth={1.5} />
          <g transform={`translate(${tipX}, ${tipY})`}>
            <rect width={tipW} height={tipH} rx={6} fill="rgba(15, 23, 42, 0.92)" />
            <text
              x={tipW / 2}
              y={hLabel ? 14 : 15}
              fontSize={hLabel ? 10 : 11}
              fontWeight={700}
              fill="rgba(226, 232, 240, 0.85)"
              textAnchor="middle"
            >
              {hLabel ?? `#${hoverIdx! + 1}`}
            </text>
            <text
              x={tipW / 2}
              y={hLabel ? 30 : 17}
              fontSize={12}
              fontWeight={800}
              fill={stroke}
              textAnchor="middle"
              dominantBaseline={hLabel ? "auto" : "hanging"}
            >
              {fmt(hv)}
            </text>
          </g>
        </g>
      ) : null}
    </svg>
  );
}

function niceStep(raw: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw))));
  const f = raw / exp;
  let nf: number;
  if (f < 1.5) nf = 1;
  else if (f < 3) nf = 2;
  else if (f < 7) nf = 5;
  else nf = 10;
  return nf * exp;
}
