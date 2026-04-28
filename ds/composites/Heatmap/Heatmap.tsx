"use client";
import { cn } from "../../utils/cn";

export interface HeatmapProps {
  data: { date: string; value: number }[];
  colorScale?: string[];
  cellSize?: number;
  gap?: number;
  className?: string;
}

const DEFAULT_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

export function Heatmap({
  data, colorScale = DEFAULT_COLORS, cellSize = 12, gap = 2, className,
}: HeatmapProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const getColor = (val: number) => {
    if (val === 0) return colorScale[0];
    const idx = Math.min(Math.ceil((val / maxVal) * (colorScale.length - 1)), colorScale.length - 1);
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
    <div className={cn("inline-block", className)}>
      <div className="flex" style={{ gap }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap }}>
            {week.map((cell, ci) => (
              <div
                key={ci}
                title={`${cell.date}: ${cell.value}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: getColor(cell.value),
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px] text-muted">
        <span>Less</span>
        {colorScale.map((c, i) => (
          <div key={i} style={{ width: cellSize, height: cellSize, backgroundColor: c, borderRadius: 2 }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
