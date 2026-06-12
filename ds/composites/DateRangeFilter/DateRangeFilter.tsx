"use client";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";

export interface DatePreset {
  key: string;
  label: string;
  getRange: () => { start: Date; end: Date };
}

export interface DateRangeFilterProps {
  /** 시작일 (YYYY-MM-DD) */
  startDate: string;
  /** 종료일 (YYYY-MM-DD) */
  endDate: string;
  /** 시작일 변경 콜백 */
  onStartChange: (date: string) => void;
  /** 종료일 변경 콜백 */
  onEndChange: (date: string) => void;
  /** 조회(적용) 콜백 */
  onApply: () => void;
  /** 초기화 콜백 */
  onReset?: () => void;
  /** 프리셋 버튼 */
  presets?: DatePreset[];
  /** 추가 클래스 */
  className?: string;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const defaultPresets: DatePreset[] = [
  {
    key: "today",
    label: "오늘",
    getRange: () => {
      const d = new Date();
      return { start: d, end: d };
    },
  },
  {
    key: "7days",
    label: "최근 7일",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { start, end };
    },
  },
  {
    key: "30days",
    label: "최근 30일",
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return { start, end };
    },
  },
  {
    key: "month",
    label: "이번 달",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    },
  },
];

/**
 * 날짜 범위 필터
 * @description 시작일/종료일 입력과 프리셋 버튼을 제공하는 날짜 범위 필터 컴포넌트
 * @example
 * <DateRangeFilter
 *   startDate={start}
 *   endDate={end}
 *   onStartChange={setStart}
 *   onEndChange={setEnd}
 *   onApply={handleApply}
 *   onReset={handleReset}
 * />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function DateRangeFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onApply,
  onReset,
  presets = defaultPresets,
  className,
}: DateRangeFilterProps) {
  const t = useT();
  const activePresetKey = presets.find((p) => {
    const range = p.getRange();
    return formatDate(range.start) === startDate && formatDate(range.end) === endDate;
  })?.key;

  function handlePreset(preset: DatePreset) {
    const range = preset.getRange();
    onStartChange(formatDate(range.start));
    onEndChange(formatDate(range.end));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          aria-label={t("ariaDateStart")}
          className={cn(
            "h-9 px-3 text-sm border border-border bg-white rounded-lg transition-all duration-150",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
          )}
        />
        <span className="text-sm text-muted">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          aria-label={t("ariaDateEnd")}
          className={cn(
            "h-9 px-3 text-sm border border-border bg-white rounded-lg transition-all duration-150",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
          )}
        />
        <button
          type="button"
          onClick={onApply}
          className={cn(
            "h-9 px-4 text-sm font-medium rounded-lg transition-all duration-150",
            "bg-primary text-white hover:bg-primary-hover active:scale-[0.97]",
            "cursor-pointer",
          )}
        >
          조회
        </button>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className={cn(
              "h-9 px-4 text-sm font-medium rounded-lg transition-all duration-150",
              "bg-transparent text-muted hover:text-foreground hover:bg-gray-100",
              "cursor-pointer",
            )}
          >
            초기화
          </button>
        )}
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => handlePreset(preset)}
              className={cn(
                "h-7 px-3 text-xs font-medium rounded-full transition-all duration-150 cursor-pointer",
                activePresetKey === preset.key
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-primary-light hover:text-primary",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
