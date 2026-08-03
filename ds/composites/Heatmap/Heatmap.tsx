"use client";
import { cn } from "../../utils/cn";

export interface HeatmapProps {
  /** 히트맵 셀 데이터 */
  data: { date: string; value: number }[];
  /** 색상 스케일 */
  colorScale?: string[];
  /** 셀 크기(px) */
  cellSize?: number;
  /** 셀 간격(px) */
  gap?: number;
  /** 추가 클래스 */
  className?: string;
}

// 초록 4단계는 기여도 히트맵의 정체성이라 그대로 둔다. 다만 0단계(#ebedf0)만은
// 라이트 전용 회색이라 다크 배경에서 흰 격자로 떠오른다 — 모드를 따라가는 변수로 바꾼다
const DEFAULT_COLORS = ["var(--border-light)", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

/**
 * 2차원 데이터를 색 강도로 표현하는 히트맵.
 * @example
 * <Heatmap data={matrix} colorScale="blue" cellSize={12} />
 * @status stable
 * @since 2.2.0
 * @tags chart
 */
export function Heatmap({
  data,
  colorScale = DEFAULT_COLORS,
  cellSize = 12,
  gap = 2,
  className,
}: HeatmapProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const getColor = (val: number) => {
    if (val === 0) return colorScale[0];
    const idx = Math.min(
      Math.ceil((val / maxVal) * (colorScale.length - 1)),
      colorScale.length - 1,
    );
    return colorScale[idx];
  };

  // Group by week
  const weeks: { date: string; value: number; day: number }[][] = [];
  let currentWeek: { date: string; value: number; day: number }[] = [];
  data.forEach((d) => {
    const day = new Date(d.date).getDay();
    if (day === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push({ ...d, day });
  });
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className={cn("max-w-full", className)}>
      {/* 주 단위 격자는 폭이 고정이라 좁은 칸에서 넘친다 — 페이지가 아니라 여기가 스크롤한다 */}
      <div className="flex overflow-x-auto overscroll-x-contain" style={{ gap }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col shrink-0" style={{ gap }}>
            {week.map((cell, ci) => (
              <div
                key={ci}
                title={`${cell.date}: ${cell.value}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: getColor(cell.value),
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted">
        <span className="whitespace-nowrap">Less</span>
        {colorScale.map((c, i) => (
          <div
            key={i}
            className="shrink-0"
            style={{ width: cellSize, height: cellSize, backgroundColor: c, borderRadius: 3 }}
          />
        ))}
        <span className="whitespace-nowrap">More</span>
      </div>
    </div>
  );
}
