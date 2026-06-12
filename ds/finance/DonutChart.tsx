"use client";

import { useMemo } from "react";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 220,
  thickness = 28,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;

  const segments = useMemo(() => {
    let acc = 0;
    return data.map((d) => {
      const startAngle = (acc / total) * Math.PI * 2 - Math.PI / 2;
      acc += d.value;
      const endAngle = (acc / total) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
      const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
      return { ...d, path, pct: (d.value / total) * 100 };
    });
  }, [data, total, cx, cy, r]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bm-num">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bm-grid)" strokeWidth={thickness} />
      {segments.map((s) => (
        <path
          key={s.label}
          d={s.path}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeLinecap="butt"
        />
      ))}
      {centerLabel ? (
        <text
          x={cx}
          y={cy - 6}
          fontSize={10.5}
          fill="var(--bm-axis)"
          textAnchor="middle"
          fontWeight={700}
        >
          {centerLabel}
        </text>
      ) : null}
      {centerValue ? (
        <text
          x={cx}
          y={cy + 12}
          fontSize={18}
          fill="var(--bm-text)"
          textAnchor="middle"
          fontWeight={800}
        >
          {centerValue}
        </text>
      ) : null}
    </svg>
  );
}
