"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface ScatterPoint {
  x: number;
  y: number;
  /** 점 크기 (버블 차트, 미설정시 기본) */
  size?: number;
  /** 라벨 (tooltip용) */
  label?: string;
}

export interface ScatterSeries {
  name: string;
  data: ScatterPoint[];
  color?: string;
}

export interface ScatterPlotProps extends HTMLAttributes<HTMLDivElement> {
  /** 시리즈 */
  series: ScatterSeries[];
  /** 너비 */
  width?: number;
  /** 높이 */
  height?: number;
  /** X축 도메인 (자동) */
  xDomain?: [number, number];
  /** Y축 도메인 (자동) */
  yDomain?: [number, number];
  /** 그리드 */
  showGrid?: boolean;
  /** Y축 라벨 */
  showYAxis?: boolean;
  /** X축 라벨 */
  showXAxis?: boolean;
  /** 범례 */
  showLegend?: boolean;
  /** 기본 점 크기 */
  defaultPointSize?: number;
}

// 첫 색만 CSS 변수고 나머지는 hex 였다 — 계열은 그대로 두되 전부 의미색 변수로 맞춰
// 다크에서 시리즈끼리 밝기가 어긋나지 않게 한다
const DEFAULT_COLORS = [
  "var(--primary)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "var(--info)",
];
const PADDING = { top: 12, right: 12, bottom: 28, left: 36 };

/**
 * SVG 산점도 / 버블 차트 (point.size 지정 시 버블).
 * @example
 * <ScatterPlot series={[{name:"A", data:[{x:1,y:2},{x:3,y:5}]}]} />
 * @status stable
 * @since 2.3.0
 * @tags chart
 */
export const ScatterPlot = forwardRef<HTMLDivElement, ScatterPlotProps>(function ScatterPlot(
  {
    series,
    width = 480,
    height = 280,
    xDomain,
    yDomain,
    showGrid = true,
    showYAxis = true,
    showXAxis = true,
    showLegend = true,
    defaultPointSize = 4,
    className,
    ...props
  },
  ref,
) {
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  const all = series.flatMap((s) => s.data);
  const xs = all.map((p) => p.x);
  const ys = all.map((p) => p.y);
  const xMin = xDomain?.[0] ?? Math.min(0, ...xs);
  const xMax = xDomain?.[1] ?? Math.max(1, ...xs);
  const yMin = yDomain?.[0] ?? Math.min(0, ...ys);
  const yMax = yDomain?.[1] ?? Math.max(1, ...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const ticks = 4;
  const xTicks = Array.from({ length: ticks + 1 }, (_, i) => xMin + (xRange * i) / ticks);
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + (yRange * i) / ticks);

  const projectX = (x: number) => PADDING.left + ((x - xMin) / xRange) * innerW;
  const projectY = (y: number) => PADDING.top + innerH - ((y - yMin) / yRange) * innerH;

  return (
    <div ref={ref} className={cn("flex items-center gap-4 max-w-full", className)} {...props}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="산점도"
        // viewBox 가 있으니 폭은 칸에 맡기고 높이는 비율로 따라오게 둔다
        className="w-full h-auto block min-w-0"
      >
        {showGrid &&
          yTicks.map((v, i) => {
            const y = projectY(v);
            return (
              <line
                key={`yg-${i}`}
                x1={PADDING.left}
                y1={y}
                x2={width - PADDING.right}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="2 2"
                strokeOpacity={0.4}
              />
            );
          })}
        {showGrid &&
          xTicks.map((v, i) => {
            const x = projectX(v);
            return (
              <line
                key={`xg-${i}`}
                x1={x}
                y1={PADDING.top}
                x2={x}
                y2={PADDING.top + innerH}
                stroke="var(--border)"
                strokeDasharray="2 2"
                strokeOpacity={0.4}
              />
            );
          })}
        {showYAxis &&
          yTicks.map((v, i) => (
            <text
              key={i}
              x={PADDING.left - 6}
              y={projectY(v) + 3}
              fontSize="10"
              textAnchor="end"
              className="fill-muted tabular-nums"
            >
              {v.toFixed(0)}
            </text>
          ))}
        {showXAxis &&
          xTicks.map((v, i) => (
            <text
              key={i}
              x={projectX(v)}
              y={height - 8}
              fontSize="10"
              textAnchor="middle"
              className="fill-muted tabular-nums"
            >
              {v.toFixed(0)}
            </text>
          ))}
        {series.map((s, si) => {
          const color = s.color ?? DEFAULT_COLORS[si % DEFAULT_COLORS.length];
          return (
            <g key={si}>
              {s.data.map((p, i) => (
                <circle
                  key={i}
                  cx={projectX(p.x)}
                  cy={projectY(p.y)}
                  r={p.size ?? defaultPointSize}
                  fill={color}
                  fillOpacity={p.size !== undefined ? 0.5 : 0.8}
                  stroke={color}
                  strokeWidth={1}
                >
                  {p.label && <title>{p.label}</title>}
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      {showLegend && (
        <ul className="flex flex-col gap-1 text-xs shrink-0 min-w-0">
          {series.map((s, i) => (
            <li key={i} className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-inset ring-black/[0.06]"
                style={{ background: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              <span className="text-foreground truncate">{s.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
