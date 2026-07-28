"use client";
import { forwardRef, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface BarSeries {
  name: string;
  data: number[];
  color?: string;
}

export type BarOrientation = "vertical" | "horizontal";
export type BarMode = "grouped" | "stacked";

export interface BarChartProps extends HTMLAttributes<HTMLDivElement> {
  /** 카테고리 라벨 */
  labels: string[];
  /** 시리즈 */
  series: BarSeries[];
  /** 너비 */
  width?: number;
  /** 높이 */
  height?: number;
  /** 방향 */
  orientation?: BarOrientation;
  /** 다중 시리즈 모드 */
  mode?: BarMode;
  /** 그리드 표시 */
  showGrid?: boolean;
  /** 값 라벨 */
  showValues?: boolean;
}

// 시리즈 구분색이다 — 의미색이 아니라 "서로 다름"을 나타내는 계열색이라 리터럴로 둔다.
// 테마가 바뀌어도 시리즈 1/2/3 의 색 대비는 그대로여야 읽힌다.
const DEFAULT_COLORS = ["var(--primary)", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];
const PADDING = { top: 12, right: 12, bottom: 28, left: 36 };

/**
 * 경량 SVG 막대 차트 (vertical/horizontal, grouped/stacked).
 * @example
 * <BarChart labels={["A","B","C"]} series={[{name:"매출", data:[10,30,20]}]} />
 * @status stable
 * @since 2.3.0
 * @tags chart
 */
export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  {
    labels,
    series,
    width = 480,
    height = 240,
    orientation = "vertical",
    mode = "grouped",
    showGrid = true,
    showValues = false,
    className,
    ...props
  },
  ref,
) {
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  const max = useMemo(() => {
    if (mode === "stacked") {
      return Math.max(
        0,
        ...labels.map((_, i) => series.reduce((sum, s) => sum + (s.data[i] ?? 0), 0)),
      );
    }
    return Math.max(0, ...series.flatMap((s) => s.data));
  }, [series, labels, mode]);
  const range = max || 1;

  const isVertical = orientation === "vertical";
  const groupCount = labels.length;
  const groupSize = (isVertical ? innerW : innerH) / Math.max(1, groupCount);
  const barsPerGroup = mode === "stacked" ? 1 : series.length;
  const barSize = groupSize / (barsPerGroup + 1);

  return (
    <div ref={ref} className={cn("inline-block max-w-full", className)} {...props}>
      {/* viewBox 가 있으므로 max-w-full + h-auto 면 좁은 칸에서 잘리지 않고 비율대로 줄어든다 */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block max-w-full h-auto"
        role="img"
        aria-label="막대 차트"
      >
        {showGrid &&
          [0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            if (isVertical) {
              const y = PADDING.top + innerH - t * innerH;
              return (
                <g key={i}>
                  <line
                    x1={PADDING.left}
                    y1={y}
                    x2={width - PADDING.right}
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray="2 2"
                    strokeOpacity={0.4}
                  />
                  <text
                    x={PADDING.left - 6}
                    y={y + 3}
                    fontSize="10"
                    textAnchor="end"
                    className="fill-muted"
                  >
                    {Math.round(t * max)}
                  </text>
                </g>
              );
            }
            const x = PADDING.left + t * innerW;
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={PADDING.top}
                  x2={x}
                  y2={PADDING.top + innerH}
                  stroke="var(--border)"
                  strokeDasharray="2 2"
                  strokeOpacity={0.4}
                />
                <text x={x} y={height - 8} fontSize="10" textAnchor="middle" className="fill-muted">
                  {Math.round(t * max)}
                </text>
              </g>
            );
          })}
        {labels.map((label, gi) => {
          const groupOffset = gi * groupSize;
          let stackAcc = 0;
          return (
            <g key={gi}>
              {series.map((s, si) => {
                const v = s.data[gi] ?? 0;
                const color = s.color ?? DEFAULT_COLORS[si % DEFAULT_COLORS.length];
                const ratio = v / range;
                if (isVertical) {
                  const x =
                    PADDING.left +
                    groupOffset +
                    (mode === "stacked" ? barSize / 2 : barSize / 2 + si * barSize);
                  const h = ratio * innerH;
                  const y =
                    mode === "stacked"
                      ? PADDING.top + innerH - (stackAcc + ratio) * innerH
                      : PADDING.top + innerH - h;
                  if (mode === "stacked") stackAcc += ratio;
                  return (
                    <g key={si}>
                      <rect x={x} y={y} width={barSize * 0.8} height={h} fill={color} rx={2} />
                      {showValues && (
                        <text
                          x={x + barSize * 0.4}
                          y={y - 4}
                          fontSize="10"
                          textAnchor="middle"
                          className="fill-muted"
                        >
                          {v}
                        </text>
                      )}
                    </g>
                  );
                }
                const y =
                  PADDING.top +
                  groupOffset +
                  (mode === "stacked" ? barSize / 2 : barSize / 2 + si * barSize);
                const w = ratio * innerW;
                const x = mode === "stacked" ? PADDING.left + stackAcc * innerW : PADDING.left;
                if (mode === "stacked") stackAcc += ratio;
                return (
                  <g key={si}>
                    <rect x={x} y={y} width={w} height={barSize * 0.8} fill={color} rx={2} />
                    {showValues && (
                      <text
                        x={x + w + 4}
                        y={y + barSize * 0.5}
                        fontSize="10"
                        className="fill-muted"
                      >
                        {v}
                      </text>
                    )}
                  </g>
                );
              })}
              {isVertical && (
                <text
                  x={PADDING.left + groupOffset + groupSize / 2}
                  y={height - 8}
                  fontSize="10"
                  textAnchor="middle"
                  className="fill-muted"
                >
                  {label}
                </text>
              )}
              {!isVertical && (
                <text
                  x={PADDING.left - 6}
                  y={PADDING.top + groupOffset + groupSize / 2 + 3}
                  fontSize="10"
                  textAnchor="end"
                  className="fill-muted"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
});
