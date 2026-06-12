"use client";
import { forwardRef, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface AreaSeries {
  name: string;
  data: number[];
  color?: string;
}

export type AreaMode = "overlap" | "stacked";

export interface AreaChartProps extends HTMLAttributes<HTMLDivElement> {
  /** x축 라벨 */
  labels?: string[];
  /** 시리즈 */
  series: AreaSeries[];
  /** 너비 */
  width?: number;
  /** 높이 */
  height?: number;
  /** 다중 시리즈 모드 */
  mode?: AreaMode;
  /** 부드러운 곡선 */
  smooth?: boolean;
  /** 그리드 */
  showGrid?: boolean;
  /** Y축 라벨 */
  showYAxis?: boolean;
  /** X축 라벨 */
  showXAxis?: boolean;
  /** 영역 투명도 */
  fillOpacity?: number;
}

const DEFAULT_COLORS = ["var(--primary)", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];
const PADDING = { top: 12, right: 12, bottom: 28, left: 36 };

function buildPath(points: { x: number; y: number }[], smooth: boolean): string {
  if (points.length === 0) return "";
  if (!smooth || points.length < 3) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  }
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/**
 * SVG 영역 차트 (overlap 또는 stacked).
 * @example
 * <AreaChart labels={["1","2","3"]} series={[{name:"a",data:[10,20,15]}]} mode="stacked" />
 * @status stable
 * @since 2.3.0
 * @tags chart
 */
export const AreaChart = forwardRef<HTMLDivElement, AreaChartProps>(function AreaChart(
  {
    labels, series, width = 480, height = 240, mode = "overlap", smooth = true,
    showGrid = true, showYAxis = true, showXAxis = true, fillOpacity = 0.25,
    className, ...props
  },
  ref,
) {
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;
  const xCount = Math.max(...series.map((s) => s.data.length));

  const stacks = useMemo(() => {
    if (mode !== "stacked") return null;
    return Array.from({ length: xCount }, (_, i) =>
      series.reduce((acc, s) => acc + (s.data[i] ?? 0), 0),
    );
  }, [series, mode, xCount]);

  const max = useMemo(() => {
    if (mode === "stacked" && stacks) return Math.max(0, ...stacks);
    return Math.max(0, ...series.flatMap((s) => s.data));
  }, [series, mode, stacks]);
  const range = max || 1;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (range * i) / ticks);

  // build points per series (with stacking offsets)
  const offsets = mode === "stacked" ? Array(xCount).fill(0) : null;
  const computed = series.map((s, si) => {
    const color = s.color ?? DEFAULT_COLORS[si % DEFAULT_COLORS.length];
    const topPoints = s.data.map((v, i) => {
      const base = offsets ? offsets[i] : 0;
      const top = base + v;
      const x = PADDING.left + (xCount === 1 ? innerW / 2 : (i / (xCount - 1)) * innerW);
      const y = PADDING.top + innerH - (top / range) * innerH;
      return { x, y };
    });
    const bottomPoints = (offsets ? offsets.map((b, i) => {
      const x = PADDING.left + (xCount === 1 ? innerW / 2 : (i / (xCount - 1)) * innerW);
      const y = PADDING.top + innerH - (b / range) * innerH;
      return { x, y };
    }) : null);
    if (offsets) {
      s.data.forEach((v, i) => { offsets[i] += v; });
    }
    const topPath = buildPath(topPoints, smooth);
    const baseline = bottomPoints ? buildPath([...bottomPoints].reverse(), smooth) : null;
    const areaPath = baseline
      ? `${topPath} L${bottomPoints![bottomPoints!.length - 1].x},${bottomPoints![bottomPoints!.length - 1].y} ${baseline.replace(/^M/, "L")} Z`
      : `${topPath} L${topPoints[topPoints.length - 1].x},${PADDING.top + innerH} L${topPoints[0].x},${PADDING.top + innerH} Z`;
    return { color, topPoints, areaPath, topPath, name: s.name };
  });

  return (
    <div ref={ref} className={cn("inline-block", className)} {...props}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="영역 차트">
        {showGrid && yTicks.map((v, i) => {
          const y = PADDING.top + innerH - (v / range) * innerH;
          return <line key={i} x1={PADDING.left} y1={y} x2={width - PADDING.right} y2={y} stroke="var(--border)" strokeDasharray="2 2" strokeOpacity={0.4} />;
        })}
        {showYAxis && yTicks.map((v, i) => {
          const y = PADDING.top + innerH - (v / range) * innerH;
          return <text key={i} x={PADDING.left - 6} y={y + 3} fontSize="10" textAnchor="end" className="fill-muted">{Math.round(v)}</text>;
        })}
        {showXAxis && labels && labels.map((l, i) => {
          const x = PADDING.left + (xCount === 1 ? innerW / 2 : (i / (xCount - 1)) * innerW);
          return <text key={i} x={x} y={height - 8} fontSize="10" textAnchor="middle" className="fill-muted">{l}</text>;
        })}
        {computed.map((c, i) => (
          <g key={i}>
            <path d={c.areaPath} fill={c.color} fillOpacity={fillOpacity} />
            <path d={c.topPath} fill="none" stroke={c.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
      </svg>
    </div>
  );
});
