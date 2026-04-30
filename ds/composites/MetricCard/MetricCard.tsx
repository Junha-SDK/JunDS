"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface MetricCardProps {
  /** 지표 라벨 */
  label: string;
  /** 표시할 값 */
  value: string | number;
  /** 변동률(%) */
  change?: number;
  /** 변동률 옆 보조 텍스트 */
  changeLabel?: string;
  /** 미니 차트용 데이터 */
  sparkline?: number[];
  /** 우측 아이콘 */
  icon?: React.ReactNode;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 지표 카드 컴포넌트
 * @example
 * <MetricCard label="매출" value="1,200만" change={12.5} changeLabel="전월 대비" />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  ({ label, value, change, changeLabel, sparkline, icon, className }, ref) => {
  const isPositive = change !== undefined && change >= 0;
  const sparkMax = sparkline ? Math.max(...sparkline) : 0;
  const sparkMin = sparkline ? Math.min(...sparkline) : 0;
  const sparkRange = sparkMax - sparkMin || 1;

  return (
    <div ref={ref} className={cn("rounded-xl border border-border bg-white p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
        </div>
        {icon && <div className="text-muted">{icon}</div>}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={cn("text-xs font-semibold", isPositive ? "text-success" : "text-danger")}>
            {isPositive ? "↑" : "↓"} {Math.abs(change)}%
          </span>
          {changeLabel && <span className="text-xs text-muted">{changeLabel}</span>}
        </div>
      )}
      {sparkline && sparkline.length > 1 && (() => {
        const w = 200;
        const h = 48;
        const pad = 4;
        const step = (w - pad * 2) / (sparkline.length - 1);
        const points = sparkline.map((v, i) => {
          const x = pad + i * step;
          const y = h - pad - ((v - sparkMin) / sparkRange) * (h - pad * 2);
          return `${x},${y}`;
        }).join(" ");
        const areaPoints = `${pad},${h - pad} ${points} ${pad + (sparkline.length - 1) * step},${h - pad}`;
        return (
          <svg className="w-full mt-3" viewBox={`0 0 ${w} ${h}`} style={{ height: 48 }}>
            <defs>
              <linearGradient id={`spark-fill-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon fill={`url(#spark-fill-${label.replace(/\s/g, "")})`} points={areaPoints} />
            <polyline
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            <circle cx={pad + (sparkline.length - 1) * step} cy={h - pad - ((sparkline[sparkline.length - 1] - sparkMin) / sparkRange) * (h - pad * 2)} r="3" fill="var(--primary)" />
          </svg>
        );
      })()}
    </div>
  );
},
);
MetricCard.displayName = "MetricCard";
