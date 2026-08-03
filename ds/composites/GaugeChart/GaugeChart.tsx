"use client";
import { cn } from "../../utils/cn";

export interface GaugeChartProps {
  /** 현재 값 */
  value: number;
  /** 최솟값 */
  min?: number;
  /** 최댓값 */
  max?: number;
  /** 중앙 라벨 */
  label?: string;
  /** 차트 크기(px) */
  size?: number;
  /** 구간별 색상 정의 */
  segments?: { color: string; from: number; to: number }[];
  /** 추가 클래스 */
  className?: string;
}

/**
 * 반원형 게이지로 단일 값을 시각화합니다.
 * @example
 * <GaugeChart value={72} min={0} max={100} label="진행률" />
 * @status stable
 * @since 2.2.0
 * @tags chart
 */
export function GaugeChart({
  value,
  min = 0,
  max = 100,
  label,
  size = 160,
  segments = [
    { color: "var(--danger)", from: 0, to: 33 },
    { color: "var(--warning)", from: 33, to: 66 },
    { color: "var(--success)", from: 66, to: 100 },
  ],
  className,
}: GaugeChartProps) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const startAngle = -210;
  const totalAngle = 240;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (from: number, to: number) => {
    const start = polarToCartesian(startAngle + from * totalAngle);
    const end = polarToCartesian(startAngle + to * totalAngle);
    const largeArc = (to - from) * totalAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const needleAngle = startAngle + pct * totalAngle;
  const needleTip = polarToCartesian(needleAngle - 180 + 360);
  const activeSegment = segments.find((s) => pct * 100 >= s.from && pct * 100 <= s.to);

  return (
    <div className={cn("inline-block", className)}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7 + 20}`}>
        {segments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(seg.from / 100, seg.to / 100)}
            fill="none"
            stroke={seg.color}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={0.2}
          />
        ))}
        <path
          d={describeArc(0, pct)}
          fill="none"
          stroke={activeSegment?.color ?? "var(--primary)"}
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="var(--foreground)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4} fill="var(--foreground)" />
        {/* Value */}
        <text
          x={cx}
          y={cy + 24}
          textAnchor="middle"
          className="text-lg font-bold"
          fill="currentColor"
        >
          {value}
        </text>
        {label && (
          <text x={cx} y={cy + 38} textAnchor="middle" className="text-[10px]" fill="var(--muted)">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}
