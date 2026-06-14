"use client";
import { cn } from "../../utils/cn";

export interface MiniChartProps {
  /** 차트 데이터 배열 */
  data: number[];
  /** 차트 종류 */
  type?: "line" | "bar" | "area";
  /** 차트 너비(px) */
  width?: number;
  /** 차트 높이(px) */
  height?: number;
  /** 선/막대 색상 */
  color?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 카드 안에 들어갈 작은 미니 차트(스파크라인).
 * @example
 * <MiniChart data={[5, 8, 12, 9, 14]} type="line" color="#3b82f6" />
 * @status stable
 * @since 2.2.0
 * @tags chart
 */
export function MiniChart({ data, type = "line", width = 120, height = 32, color = "var(--primary)", className }: MiniChartProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} className={cn("inline-block", className)} aria-hidden="true">
      {type === "bar" ? (
        data.map((v, i) => {
          const barH = ((v - min) / range) * (height - 4);
          const barW = Math.max(2, step - 2);
          return <rect key={i} x={i * step} y={height - barH - 2} width={barW} height={barH} fill={color} rx={1} opacity={0.8} />;
        })
      ) : (
        <>
          {type === "area" && <path d={areaD} fill={color} opacity={0.1} />}
          <path d={pathD} pathLength={1} className="bm-draw-in" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2} fill={color} />
        </>
      )}
    </svg>
  );
}
