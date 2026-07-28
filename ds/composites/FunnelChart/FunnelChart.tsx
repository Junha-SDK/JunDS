"use client";
import { cn } from "../../utils/cn";

export interface FunnelChartProps {
  /** 퍼널 단계 데이터 */
  data: { label: string; value: number; color?: string }[];
  /** 차트 높이(px) */
  height?: number;
  /** 추가 클래스 */
  className?: string;
}

const DEFAULT_COLORS = [
  "var(--primary)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
];

/**
 * 단계별 전환율을 시각화하는 퍼널 차트.
 * @example
 * <FunnelChart data={[{ label: "방문", value: 1000 }, { label: "구매", value: 200 }]} />
 * @status stable
 * @since 2.2.0
 * @tags chart
 */
export function FunnelChart({ data, height = 300, className }: FunnelChartProps) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.value));
  const stepH = height / data.length;

  return (
    <div className={cn("w-full", className)}>
      {data.map((item, i) => {
        const widthPct = (item.value / maxVal) * 100;
        const color = item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
        const convRate = i > 0 ? ((item.value / data[i - 1].value) * 100).toFixed(1) : null;
        return (
          <div key={i} className="flex items-center gap-3" style={{ height: stepH }}>
            <div className="flex-1 min-w-0 flex justify-center">
              <div
                className={cn(
                  "rounded-xl flex items-center justify-center text-white text-sm font-bold tabular-nums",
                  // 폭만 바뀌는 막대다. all 로 두면 height·font-size 까지 전이 대상이 된다
                  "transition-[width] duration-500 ease-out motion-reduce:transition-none",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
                )}
                style={{
                  width: `${widthPct}%`,
                  height: stepH - 4,
                  backgroundColor: color,
                  minWidth: 60,
                }}
              >
                {item.value.toLocaleString()}
              </div>
            </div>
            <div className="w-32 shrink-0 min-w-0 text-right">
              <p className="text-sm font-medium truncate">{item.label}</p>
              {convRate && (
                <p className="text-[10px] text-muted tabular-nums whitespace-nowrap">
                  전환: {convRate}%
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
