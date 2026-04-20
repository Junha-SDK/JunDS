"use client";
import { cn } from "../../utils/cn";

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export type ChartType = "bar" | "donut" | "sparkline";

export interface ChartCardProps {
  title: string;
  type: ChartType;
  data: ChartDataPoint[];
  className?: string;
}

/**
 * SVG 차트 카드 (bar, donut, sparkline)
 * @example
 * <ChartCard title="주간 완료" type="bar" data={[{label:"월",value:12},{label:"화",value:8}]} />
 */
export function ChartCard({ title, type, data, className }: ChartCardProps) {
  return (
    <div className={cn("bg-white border border-border rounded-xl p-4", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {type === "bar" && <BarChart data={data} />}
      {type === "donut" && <DonutChart data={data} />}
      {type === "sparkline" && <SparklineChart data={data} />}
    </div>
  );
}

function BarChart({ data }: { data: ChartDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-foreground tabular-nums">{d.value}</span>
            <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${pct}%`, backgroundColor: d.color || "var(--primary)", minHeight: 4 }} />
            <span className="text-[10px] text-muted truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data }: { data: ChartDataPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const defaultColors = ["var(--primary)", "var(--success)", "var(--warning)", "var(--danger)", "var(--accent)", "#6b7280"];
  let cumulative = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 36 36" className="shrink-0">
        {data.map((d, i) => {
          const pct = (d.value / total) * 100;
          const offset = cumulative;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx="18" cy="18" r="14"
              fill="none"
              stroke={d.color || defaultColors[i % defaultColors.length]}
              strokeWidth="4"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
            />
          );
        })}
        <text x="18" y="18" textAnchor="middle" dominantBaseline="central" className="text-[6px] font-bold fill-foreground">
          {total}
        </text>
      </svg>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color || defaultColors[i % defaultColors.length] }} />
            <span className="text-muted truncate flex-1">{d.label}</span>
            <span className="font-semibold text-foreground tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SparklineChart({ data }: { data: ChartDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const w = 200;
  const h = 40;
  const points = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * w,
    y: h - ((d.value - min) / (max - min || 1)) * h,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${path} L${w},${h} L0,${h} Z`;

  return (
    <div>
      <svg width="100%" height={h + 10} viewBox={`0 -5 ${w} ${h + 10}`} className="overflow-visible">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkFill)" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.length > 0 && (
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="var(--primary)" />
        )}
      </svg>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted">{data[0]?.label}</span>
        <span className="text-[10px] font-semibold text-foreground">{data[data.length - 1]?.value}</span>
        <span className="text-[10px] text-muted">{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
