"use client";

import { useId } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  /** Gradient fill color. Pass a base color (e.g. "var(--bm-up)"). */
  fill?: string;
  className?: string;
  /** Render dot at the latest value. */
  showEndDot?: boolean;
  /** Show baseline reference line at first value. */
  showBaseline?: boolean;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "var(--bm-up)",
  fill,
  className,
  showEndDot = true,
  showBaseline = false,
  strokeWidth = 1.6,
}: SparklineProps) {
  const id = useId();
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length === 1 ? 0 : width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return { x, y };
  });
  const polyPts = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillPath = fill
    ? `M0,${height} L${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L")} L${width},${height} Z`
    : null;

  const last = points[points.length - 1];
  const baselineY = points[0]?.y ?? 0;
  const gradId = `spark-grad-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      {fill ? (
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity={0.45} />
            <stop offset="100%" stopColor={fill} stopOpacity={0.02} />
          </linearGradient>
        </defs>
      ) : null}
      {fillPath ? <path d={fillPath} fill={`url(#${gradId})`} /> : null}
      {showBaseline ? (
        <line
          x1={0}
          x2={width}
          y1={baselineY}
          y2={baselineY}
          stroke={color}
          strokeOpacity={0.25}
          strokeDasharray="2 2"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      <polyline
        points={polyPts}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {showEndDot && last ? (
        <>
          <circle cx={last.x} cy={last.y} r={3.4} fill={color} fillOpacity={0.18} />
          <circle cx={last.x} cy={last.y} r={1.8} fill={color} />
        </>
      ) : null}
    </svg>
  );
}
