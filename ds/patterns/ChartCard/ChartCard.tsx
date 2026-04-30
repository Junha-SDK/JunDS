"use client";
import { useId, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ChartSegment {
  label: string;
  value: number;
  color?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  /** stacked-bar에서 한 행을 여러 조각으로 나눌 때 사용 */
  segments?: ChartSegment[];
}

export type ChartType =
  | "bar"
  | "horizontal-bar"
  | "stacked-bar"
  | "line"
  | "area"
  | "donut"
  | "sparkline"
  | "progress"
  | "radial";

export type ChartTone = "default" | "success" | "warning" | "danger" | "info";

export interface ChartTrend {
  value: string;
  direction?: "up" | "down" | "neutral";
  label?: string;
}

export interface ChartCardProps {
  /** 카드 제목 */
  title: string;
  /** 차트 종류 */
  type: ChartType;
  /** 데이터 배열 */
  data: ChartDataPoint[];
  /** 설명 텍스트 */
  description?: string;
  /** 헤더에 크게 표시할 KPI 값 */
  value?: ReactNode;
  /** 추세 정보 */
  trend?: ChartTrend;
  /** 헤더 배지 */
  badge?: ReactNode;
  /** 헤더 액션 영역 */
  actions?: ReactNode;
  /** 푸터 영역 */
  footer?: ReactNode;
  /** 차트 영역 높이 */
  height?: number;
  /** progress/radial/horizontal-bar의 기준값 */
  max?: number;
  /** 숫자 포맷터 */
  formatValue?: (value: number) => string;
  /** 범례 표시 여부 */
  showLegend?: boolean;
  /** 그리드 표시 여부 */
  showGrid?: boolean;
  /** 축 표시 여부 */
  showAxis?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 색상 톤 */
  tone?: ChartTone;
  /** 카드/플레인 변형 */
  variant?: "card" | "plain";
  /** 추가 클래스 */
  className?: string;
}

type ChartRendererProps = {
  title: string;
  data: ChartDataPoint[];
  height: number;
  max?: number;
  formatValue: (value: number) => string;
  showLegend: boolean;
  showGrid: boolean;
  showAxis: boolean;
  tone: ChartTone;
};

type Point = {
  x: number;
  y: number;
  value: number;
  label: string;
};

const chartPalette = [
  "var(--primary)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "var(--accent)",
  "var(--muted)",
  "var(--info)",
  "var(--danger)",
];

const toneColor: Record<ChartTone, string> = {
  default: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
};

const defaultHeights: Record<ChartType, number> = {
  bar: 168,
  "horizontal-bar": 168,
  "stacked-bar": 168,
  line: 176,
  area: 176,
  donut: 156,
  sparkline: 76,
  progress: 160,
  radial: 156,
};

/**
 * SVG 차트 카드
 * @example
 * <ChartCard title="주간 완료" type="bar" data={[{label:"월",value:12},{label:"화",value:8}]} />
 * <ChartCard title="전환율" type="radial" value="72%" data={[{label:"전환",value:72}]} max={100} />
 * @status stable
 * @since 2.2.0
 * @tags chart
 */
export function ChartCard({
  title,
  type,
  data,
  description,
  value,
  trend,
  badge,
  actions,
  footer,
  height,
  max,
  formatValue = defaultFormatValue,
  showLegend,
  showGrid = true,
  showAxis = true,
  loading,
  emptyMessage = "표시할 데이터가 없습니다",
  tone = "default",
  variant = "card",
  className,
}: ChartCardProps) {
  const chartHeight = height ?? defaultHeights[type];
  const resolvedShowLegend =
    showLegend ?? (type === "donut" || type === "stacked-bar" || type === "radial");
  const hasData = data.length > 0;

  return (
    <section
      className={cn(
        "w-full transition-colors duration-200",
        variant === "card" && "bg-white border border-border rounded-xl p-4 shadow-xs",
        variant === "plain" && "p-0",
        className,
      )}
      aria-busy={loading || undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && <p className="mt-1 text-xs text-muted">{description}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {(value || trend) && (
        <div className="mt-4 flex items-end justify-between gap-3">
          {value && <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>}
          {trend && <TrendPill trend={trend} />}
        </div>
      )}

      <div className={cn(value || trend ? "mt-4" : "mt-3")}>
        {loading ? (
          <ChartSkeleton height={chartHeight} />
        ) : hasData ? (
          <ChartRenderer
            type={type}
            title={title}
            data={data}
            height={chartHeight}
            max={max}
            formatValue={formatValue}
            showLegend={resolvedShowLegend}
            showGrid={showGrid}
            showAxis={showAxis}
            tone={tone}
          />
        ) : (
          <ChartEmptyState height={chartHeight} message={emptyMessage} />
        )}
      </div>

      {footer && <div className="mt-4 border-t border-border-light pt-3">{footer}</div>}
    </section>
  );
}

function ChartRenderer({ type, ...props }: ChartRendererProps & { type: ChartType }) {
  if (type === "bar") return <BarChart {...props} />;
  if (type === "horizontal-bar") return <HorizontalBarChart {...props} />;
  if (type === "stacked-bar") return <StackedBarChart {...props} />;
  if (type === "line") return <LineChart {...props} area={false} />;
  if (type === "area") return <LineChart {...props} area />;
  if (type === "donut") return <DonutChart {...props} />;
  if (type === "sparkline") return <SparklineChart {...props} />;
  if (type === "progress") return <ProgressChart {...props} />;
  return <RadialChart {...props} />;
}

function BarChart({ title, data, height, max, formatValue, showGrid, showAxis, tone }: ChartRendererProps) {
  const resolvedMax = max ?? Math.max(...data.map((point) => point.value), 1);

  return (
    <div className="relative" style={{ height }} role="img" aria-label={`${title} 막대 차트`}>
      {showGrid && <GridLines />}
      <div className="relative z-10 flex h-full items-end gap-2 pt-5">
        {data.map((point, index) => {
          const pct = toPercent(point.value, resolvedMax);
          return (
            <div key={point.label} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-semibold tabular-nums text-foreground">
                {formatValue(point.value)}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${pct}%`,
                    minHeight: point.value > 0 ? 4 : 0,
                    backgroundColor: point.color || paletteColor(index, tone),
                  }}
                />
              </div>
              {showAxis && (
                <span className="w-full truncate text-center text-[10px] text-muted">{point.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizontalBarChart({
  title,
  data,
  height,
  max,
  formatValue,
  showAxis,
  tone,
}: ChartRendererProps) {
  const resolvedMax = max ?? Math.max(...data.map((point) => point.value), 1);

  return (
    <div
      className="flex flex-col justify-center gap-3"
      style={{ minHeight: height }}
      role="img"
      aria-label={`${title} 가로 막대 차트`}
    >
      {data.map((point, index) => {
        const pct = toPercent(point.value, resolvedMax);
        return (
          <div key={point.label} className="grid grid-cols-[minmax(4rem,7rem)_1fr_auto] items-center gap-3">
            <span className="truncate text-xs font-medium text-muted">{point.label}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: point.color || paletteColor(index, tone) }}
              />
            </div>
            {showAxis && (
              <span className="min-w-8 text-right text-xs font-semibold tabular-nums text-foreground">
                {formatValue(point.value)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StackedBarChart({
  title,
  data,
  height,
  max,
  formatValue,
  showLegend,
  tone,
}: ChartRendererProps) {
  const rows = data.map((point) => {
    const segments = point.segments?.length
      ? point.segments
      : [{ label: point.label, value: point.value, color: point.color }];
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    return { ...point, segments, total };
  });
  const resolvedMax = max ?? Math.max(...rows.map((row) => row.total), 1);
  const legendItems = getStackedLegendItems(rows);

  return (
    <div className="flex flex-col justify-center gap-3" style={{ minHeight: height }} role="img" aria-label={`${title} 누적 막대 차트`}>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(4rem,6rem)_1fr_auto] items-center gap-3">
            <span className="truncate text-xs font-medium text-muted">{row.label}</span>
            <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
              {row.segments.map((segment, index) => (
                <div
                  key={`${row.label}-${segment.label}`}
                  title={`${segment.label}: ${formatValue(segment.value)}`}
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${toPercent(segment.value, resolvedMax)}%`,
                    backgroundColor: segment.color || paletteColor(index, tone),
                  }}
                />
              ))}
            </div>
            <span className="min-w-8 text-right text-xs font-semibold tabular-nums text-foreground">
              {formatValue(row.total)}
            </span>
          </div>
        ))}
      </div>
      {showLegend && <ChartLegend items={legendItems} />}
    </div>
  );
}

function LineChart({
  title,
  data,
  height,
  formatValue,
  showGrid,
  showAxis,
  tone,
  area,
}: ChartRendererProps & { area: boolean }) {
  const gradientId = `chartFill-${useId().replace(/:/g, "")}`;
  const width = 320;
  const padding = { top: 12, right: 8, bottom: showAxis ? 28 : 8, left: 8 };
  const points = buildPoints(data, width, height, padding);
  const path = pointsToPath(points);
  const bottomY = height - padding.bottom;
  const areaPath = points.length ? `${path} L${points[points.length - 1].x},${bottomY} L${points[0].x},${bottomY} Z` : "";
  const stroke = toneColor[tone];

  return (
    <div role="img" aria-label={`${title} ${area ? "영역" : "라인"} 차트`}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <title>{title}</title>
        {area && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}
        {showGrid && <SvgGrid width={width} height={height} bottom={padding.bottom} />}
        {area && <path d={areaPath} fill={`url(#${gradientId})`} />}
        <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <circle
            key={`${point.label}-${index}`}
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 4 : 2.5}
            fill="white"
            stroke={data[index]?.color || stroke}
            strokeWidth="2"
          />
        ))}
      </svg>
      {showAxis && <ChartAxis data={data} formatValue={formatValue} />}
    </div>
  );
}

function DonutChart({ title, data, height, formatValue, showLegend, tone }: ChartRendererProps) {
  const total = data.reduce((sum, point) => sum + point.value, 0) || 1;
  const arcs = data.reduce(
    (state, point, index) => {
      const pct = (point.value / total) * 100;
      return {
        offset: state.offset + pct,
        items: [...state.items, { point, index, pct, offset: state.offset }],
      };
    },
    { offset: 0, items: [] as { point: ChartDataPoint; index: number; pct: number; offset: number }[] },
  );

  return (
    <div className="flex items-center gap-5" style={{ minHeight: height }} role="img" aria-label={`${title} 도넛 차트`}>
      <svg width="118" height="118" viewBox="0 0 36 36" className="shrink-0">
        <title>{title}</title>
        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-light)" strokeWidth="4" />
        {arcs.items.map(({ point, index, pct, offset }) => (
          <circle
            key={point.label}
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke={point.color || paletteColor(index, tone)}
            strokeWidth="4"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            className="transition-all duration-500"
            pathLength={100}
            style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
          />
        ))}
        <text x="18" y="16" textAnchor="middle" className="fill-foreground text-[6px] font-bold">
          {formatValue(total)}
        </text>
        <text x="18" y="22" textAnchor="middle" className="fill-muted text-[3px]">
          total
        </text>
      </svg>
      {showLegend && (
        <ChartLegend
          className="flex-1"
          items={data.map((point, index) => ({
            label: point.label,
            value: formatValue(point.value),
            color: point.color || paletteColor(index, tone),
          }))}
        />
      )}
    </div>
  );
}

function SparklineChart({ title, data, height, formatValue, tone }: ChartRendererProps) {
  const gradientId = `sparkFill-${useId().replace(/:/g, "")}`;
  const width = 260;
  const padding = { top: 6, right: 4, bottom: 6, left: 4 };
  const points = buildPoints(data, width, height, padding);
  const path = pointsToPath(points);
  const bottomY = height - padding.bottom;
  const areaPath = points.length ? `${path} L${points[points.length - 1].x},${bottomY} L${points[0].x},${bottomY} Z` : "";
  const stroke = toneColor[tone];
  const last = data[data.length - 1];

  return (
    <div role="img" aria-label={`${title} 스파크라인`}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <title>{title}</title>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.length > 0 && (
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3.5" fill={stroke} />
        )}
      </svg>
      <div className="mt-1 flex items-center justify-between text-[10px]">
        <span className="truncate text-muted">{data[0]?.label}</span>
        {last && <span className="font-semibold tabular-nums text-foreground">{formatValue(last.value)}</span>}
        <span className="truncate text-muted">{last?.label}</span>
      </div>
    </div>
  );
}

function ProgressChart({ title, data, height, max, formatValue, tone }: ChartRendererProps) {
  const resolvedMax = max ?? 100;

  return (
    <div className="flex flex-col justify-center gap-4" style={{ minHeight: height }} role="img" aria-label={`${title} 진행률 차트`}>
      {data.map((point, index) => {
        const pct = toPercent(point.value, resolvedMax);
        return (
          <div key={point.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="truncate text-xs font-medium text-foreground">{point.label}</span>
              <span className="text-xs font-semibold tabular-nums text-muted">{formatValue(point.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: point.color || paletteColor(index, tone) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RadialChart({ title, data, height, max, formatValue, showLegend, tone }: ChartRendererProps) {
  const point = data[0];
  const resolvedMax = max ?? 100;
  const pct = toPercent(point.value, resolvedMax);
  const stroke = point.color || toneColor[tone];

  return (
    <div className="flex items-center gap-5" style={{ minHeight: height }} role="img" aria-label={`${title} 방사형 차트`}>
      <svg width="118" height="118" viewBox="0 0 36 36" className="shrink-0">
        <title>{title}</title>
        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-light)" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeLinecap="round"
          pathLength={100}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />
        <text x="18" y="16.5" textAnchor="middle" className="fill-foreground text-[7px] font-bold">
          {Math.round(pct)}%
        </text>
        <text x="18" y="22.5" textAnchor="middle" className="fill-muted text-[3px]">
          {formatValue(point.value)}
        </text>
      </svg>
      {showLegend && (
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">{point.label}</div>
          <div className="mt-1 text-xs text-muted">
            목표 {formatValue(resolvedMax)} 중 {formatValue(point.value)}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: stroke }} />
          </div>
        </div>
      )}
    </div>
  );
}

function TrendPill({ trend }: { trend: ChartTrend }) {
  const direction = trend.direction ?? "neutral";
  const className = {
    up: "bg-success-light text-success",
    down: "bg-danger-light text-danger",
    neutral: "bg-gray-100 text-muted",
  }[direction];

  return (
    <div className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold", className)}>
      <TrendIcon direction={direction} />
      <span>{trend.value}</span>
      {trend.label && <span className="font-normal opacity-80">{trend.label}</span>}
    </div>
  );
}

function TrendIcon({ direction }: { direction: "up" | "down" | "neutral" }) {
  if (direction === "neutral") {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={direction === "down" ? "rotate-180" : undefined}
    >
      <path d="M3 7.5 6 4.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartLegend({
  items,
  className,
}: {
  items: { label: string; value?: string; color: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-center gap-2 text-xs">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="min-w-0 flex-1 truncate text-muted">{item.label}</span>
          {item.value && <span className="font-semibold tabular-nums text-foreground">{item.value}</span>}
        </div>
      ))}
    </div>
  );
}

function GridLines() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 top-5 flex flex-col justify-between">
      {Array.from({ length: 4 }, (_, index) => (
        <span key={index} className="border-t border-border-light" />
      ))}
    </div>
  );
}

function SvgGrid({ width, height, bottom }: { width: number; height: number; bottom: number }) {
  const rows = 4;
  return (
    <g aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => {
        const y = 12 + (index / (rows - 1)) * (height - bottom - 12);
        return <line key={index} x1="0" x2={width} y1={y} y2={y} stroke="var(--border-light)" strokeWidth="1" />;
      })}
    </g>
  );
}

function ChartAxis({ data, formatValue }: { data: ChartDataPoint[]; formatValue: (value: number) => string }) {
  const first = data[0];
  const last = data[data.length - 1];
  const max = Math.max(...data.map((point) => point.value));

  return (
    <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-muted">
      <span className="truncate">{first?.label}</span>
      <span className="font-semibold tabular-nums text-foreground">{formatValue(max)}</span>
      <span className="truncate">{last?.label}</span>
    </div>
  );
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div className="flex animate-pulse items-end gap-2" style={{ height }}>
      {Array.from({ length: 7 }, (_, index) => (
        <div
          key={index}
          className="flex-1 rounded-t-md bg-gray-200"
          style={{ height: `${32 + ((index * 17) % 52)}%` }}
        />
      ))}
    </div>
  );
}

function ChartEmptyState({ height, message }: { height: number; message: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-dashed border-border bg-gray-50/60 text-sm text-muted"
      style={{ minHeight: height }}
    >
      {message}
    </div>
  );
}

function buildPoints(
  data: ChartDataPoint[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
): Point[] {
  const values = data.map((point) => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  return data.map((point, index) => ({
    x: padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth,
    y: padding.top + innerHeight - ((point.value - min) / range) * innerHeight,
    value: point.value,
    label: point.label,
  }));
}

function pointsToPath(points: Point[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${round(point.x)},${round(point.y)}`).join(" ");
}

function getStackedLegendItems(
  rows: { segments: ChartSegment[] }[],
): { label: string; value?: string; color: string }[] {
  const labels = new Map<string, { label: string; color: string }>();

  rows.forEach((row) => {
    row.segments.forEach((segment, index) => {
      if (!labels.has(segment.label)) {
        labels.set(segment.label, {
          label: segment.label,
          color: segment.color || chartPalette[index % chartPalette.length],
        });
      }
    });
  });

  return Array.from(labels.values());
}

function paletteColor(index: number, tone: ChartTone) {
  if (index === 0) return toneColor[tone];
  return chartPalette[index % chartPalette.length];
}

function toPercent(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function defaultFormatValue(value: number) {
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value);
}
