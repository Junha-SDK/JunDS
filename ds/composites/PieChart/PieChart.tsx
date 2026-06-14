"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface PieSlice {
  /** 라벨 */
  label: string;
  /** 값 */
  value: number;
  /** 색상 */
  color?: string;
}

export interface PieChartProps extends HTMLAttributes<HTMLDivElement> {
  /** 데이터 */
  data: PieSlice[];
  /** 크기(px) */
  size?: number;
  /** 도넛 모드 (안쪽 비율 0~1) */
  innerRatio?: number;
  /** 범례 표시 */
  showLegend?: boolean;
  /** 가운데 라벨 (도넛) */
  centerLabel?: string;
}

const DEFAULT_COLORS = ["var(--bm-cat-1)", "var(--bm-cat-2)", "var(--bm-cat-3)", "var(--bm-cat-4)", "var(--bm-cat-5)", "var(--bm-cat-6)", "var(--bm-cat-7)"];

function arcPath(cx: number, cy: number, r: number, ir: number, startAngle: number, endAngle: number): string {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const x0 = cx + r * Math.cos(startAngle);
  const y0 = cy + r * Math.sin(startAngle);
  const x1 = cx + r * Math.cos(endAngle);
  const y1 = cy + r * Math.sin(endAngle);
  if (ir > 0) {
    const x2 = cx + ir * Math.cos(endAngle);
    const y2 = cy + ir * Math.sin(endAngle);
    const x3 = cx + ir * Math.cos(startAngle);
    const y3 = cy + ir * Math.sin(startAngle);
    return `M${x0},${y0} A${r},${r} 0 ${largeArc} 1 ${x1},${y1} L${x2},${y2} A${ir},${ir} 0 ${largeArc} 0 ${x3},${y3} Z`;
  }
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${largeArc} 1 ${x1},${y1} Z`;
}

/**
 * 경량 SVG 파이/도넛 차트.
 * @example
 * <PieChart data={[{label:"A", value:30},{label:"B", value:70}]} innerRatio={0.6} centerLabel="100%" />
 * @status stable
 * @since 2.3.0
 * @tags chart
 */
export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(function PieChart(
  { data, size = 200, innerRatio = 0, showLegend = true, centerLabel, className, ...props },
  ref,
) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const ir = r * innerRatio;

  let cursor = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    const color = d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
    const path = arcPath(cx, cy, r, ir, cursor, cursor + angle);
    const start = cursor;
    cursor += angle;
    return { ...d, color, path, percent: (d.value / total) * 100, start };
  });

  return (
    <div ref={ref} className={cn("inline-flex items-center gap-4", className)} {...props}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="파이 차트">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}>
            <title>{s.label}: {s.percent.toFixed(1)}%</title>
          </path>
        ))}
        {centerLabel && innerRatio > 0 && (
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={size * 0.12} className="fill-foreground font-semibold">
            {centerLabel}
          </text>
        )}
      </svg>
      {showLegend && (
        <ul className="flex flex-col gap-1 text-xs">
          {slices.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-foreground">{s.label}</span>
              <span className="text-muted tabular-nums">{s.percent.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
