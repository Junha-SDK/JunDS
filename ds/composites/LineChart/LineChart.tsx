"use client";
import { forwardRef, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface LineSeries {
  /** 시리즈 이름 */
  name: string;
  /** 데이터 (x, y) */
  data: number[];
  /** 색상 */
  color?: string;
  /** 영역 채움 */
  area?: boolean;
}

export interface LineChartProps extends HTMLAttributes<HTMLDivElement> {
  /** x 축 라벨 */
  labels?: string[];
  /** 시리즈 (단일/다중) */
  series: LineSeries[];
  /** 너비 */
  width?: number;
  /** 높이 */
  height?: number;
  /** Y축 라벨 표시 */
  showYAxis?: boolean;
  /** X축 라벨 표시 */
  showXAxis?: boolean;
  /** 그리드 표시 */
  showGrid?: boolean;
  /** 점 표시 */
  showDots?: boolean;
  /** 곡선 보간 */
  smooth?: boolean;
}

const DEFAULT_COLORS = ["var(--primary)", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];
const PADDING = { top: 12, right: 12, bottom: 28, left: 36 };

function buildPath(points: { x: number; y: number }[], smooth: boolean): string {
  if (points.length === 0) return "";
  if (!smooth || points.length < 3) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  }
  // Catmull-Rom-ish smooth via cubic bezier
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
 * 경량 SVG 라인 차트 (외부 라이브러리 X). 다중 시리즈, 영역 채움, 부드러운 곡선 지원.
 * @example
 * <LineChart labels={["1월","2월","3월"]} series={[{name:"매출", data:[10,20,15]}]} />
 * @status stable
 * @since 2.3.0
 * @tags chart
 */
export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(function LineChart(
  { labels, series, width = 480, height = 240, showYAxis = true, showXAxis = true, showGrid = true, showDots = true, smooth = true, className, ...props },
  ref,
) {
  const allValues = useMemo(() => series.flatMap((s) => s.data), [series]);
  const max = Math.max(0, ...allValues);
  const min = Math.min(0, ...allValues);
  const range = max - min || 1;

  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => min + (range * i) / ticks);

  const xCount = Math.max(...series.map((s) => s.data.length));

  const seriesPaths = series.map((s, si) => {
    const color = s.color ?? DEFAULT_COLORS[si % DEFAULT_COLORS.length];
    const points = s.data.map((v, i) => ({
      x: PADDING.left + (xCount === 1 ? innerW / 2 : (i / (xCount - 1)) * innerW),
      y: PADDING.top + innerH - ((v - min) / range) * innerH,
    }));
    const linePath = buildPath(points, smooth);
    const areaPath = points.length > 0
      ? `${linePath} L${points[points.length - 1].x},${PADDING.top + innerH} L${points[0].x},${PADDING.top + innerH} Z`
      : "";
    return { color, points, linePath, areaPath, area: s.area, name: s.name };
  });

  return (
    <div ref={ref} className={cn("inline-block", className)} {...props}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="라인 차트">
        {showGrid && yTicks.map((v, i) => {
          const y = PADDING.top + innerH - ((v - min) / range) * innerH;
          return <line key={i} x1={PADDING.left} y1={y} x2={width - PADDING.right} y2={y} stroke="var(--border)" strokeDasharray="2 2" strokeOpacity={0.4} />;
        })}
        {showYAxis && yTicks.map((v, i) => {
          const y = PADDING.top + innerH - ((v - min) / range) * innerH;
          return <text key={i} x={PADDING.left - 6} y={y + 3} fontSize="10" textAnchor="end" className="fill-muted">{Math.round(v)}</text>;
        })}
        {showXAxis && labels && labels.map((l, i) => {
          const x = PADDING.left + (xCount === 1 ? innerW / 2 : (i / (xCount - 1)) * innerW);
          return <text key={i} x={x} y={height - 8} fontSize="10" textAnchor="middle" className="fill-muted">{l}</text>;
        })}
        {seriesPaths.map((s, si) => (
          <g key={si}>
            {s.area && <path d={s.areaPath} fill={s.color} fillOpacity={0.15} />}
            <path d={s.linePath} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {showDots && s.points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={s.color} />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
});
