"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface RadarSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface RadarChartProps extends HTMLAttributes<HTMLDivElement> {
  /** 축 라벨 (3개 이상 권장) */
  axes: string[];
  /** 시리즈 (각 데이터 길이는 axes.length와 같아야 함) */
  series: RadarSeries[];
  /** 크기(px, 정사각) */
  size?: number;
  /** 최대값 (스케일 기준, 미설정이면 자동) */
  max?: number;
  /** 그리드 단계 */
  gridSteps?: number;
  /** 영역 채움 투명도 */
  fillOpacity?: number;
  /** 점 표시 */
  showDots?: boolean;
  /** 범례 */
  showLegend?: boolean;
}

const DEFAULT_COLORS = ["var(--bm-cat-1)", "var(--bm-cat-2)", "var(--bm-cat-3)", "var(--bm-cat-4)", "var(--bm-cat-5)"];

/**
 * SVG 레이더(스파이더) 차트 — 다축 비교용.
 * @example
 * <RadarChart axes={["속도","품질","가격","UX","지원"]} series={[{name:"A",data:[3,5,4,5,2]}]} max={5} />
 * @status stable
 * @since 2.3.0
 * @tags chart
 */
export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(function RadarChart(
  { axes, series, size = 280, max, gridSteps = 4, fillOpacity = 0.2, showDots = true, showLegend = true, className, ...props },
  ref,
) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 30;
  const n = axes.length;
  const computedMax = max ?? Math.max(0, ...series.flatMap((s) => s.data));
  const range = computedMax || 1;

  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;

  const polygonPoints = (data: number[]) =>
    data.map((v, i) => {
      const ratio = v / range;
      const a = angle(i);
      return `${cx + r * ratio * Math.cos(a)},${cy + r * ratio * Math.sin(a)}`;
    }).join(" ");

  return (
    <div ref={ref} className={cn("inline-flex items-center gap-4", className)} {...props}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="레이더 차트">
        {/* grid polygons */}
        {Array.from({ length: gridSteps }, (_, gi) => {
          const ratio = (gi + 1) / gridSteps;
          const points = axes.map((_, i) => {
            const a = angle(i);
            return `${cx + r * ratio * Math.cos(a)},${cy + r * ratio * Math.sin(a)}`;
          }).join(" ");
          return <polygon key={gi} points={points} fill="none" stroke="var(--border)" strokeOpacity={0.4} strokeWidth={1} />;
        })}
        {/* axis lines + labels */}
        {axes.map((label, i) => {
          const a = angle(i);
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          const labelX = cx + (r + 14) * Math.cos(a);
          const labelY = cy + (r + 14) * Math.sin(a);
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeOpacity={0.3} strokeWidth={1} />
              <text x={labelX} y={labelY} fontSize="10" textAnchor="middle" dominantBaseline="middle" className="fill-muted">{label}</text>
            </g>
          );
        })}
        {/* data polygons */}
        {series.map((s, si) => {
          const color = s.color ?? DEFAULT_COLORS[si % DEFAULT_COLORS.length];
          const points = polygonPoints(s.data);
          return (
            <g key={si}>
              <polygon points={points} fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
              {showDots && s.data.map((v, i) => {
                const ratio = v / range;
                const a = angle(i);
                return <circle key={i} cx={cx + r * ratio * Math.cos(a)} cy={cy + r * ratio * Math.sin(a)} r={2.5} fill={color} />;
              })}
            </g>
          );
        })}
      </svg>
      {showLegend && (
        <ul className="flex flex-col gap-1 text-xs">
          {series.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }} />
              <span className="text-foreground">{s.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
