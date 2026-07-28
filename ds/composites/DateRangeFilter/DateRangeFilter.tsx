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
            // bg-white 는 다크에서 라이트 면으로 남는다 — 카드 토큰이 모드를 따라간다.
            // 바뀌는 건 테두리와 글로우뿐이라 transition-all 로 잡을 이유가 없다.
            "h-9 px-3 text-sm border border-border bg-card rounded-xl",
            "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-150",
            "hover:border-muted-light",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          )}
        />
        <span className="text-sm text-muted">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          aria-label={t("ariaDateEnd")}
          className={cn(
            // bg-white 는 다크에서 라이트 면으로 남는다 — 카드 토큰이 모드를 따라간다.
            // 바뀌는 건 테두리와 글로우뿐이라 transition-all 로 잡을 이유가 없다.
            "h-9 px-3 text-sm border border-border bg-card rounded-xl",
            "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-150",
            "hover:border-muted-light",
            "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          )}
        />
        <button
          type="button"
          onClick={onApply}
          className={cn(
            "h-9 px-4 text-sm font-medium rounded-xl cursor-pointer",
            "transition-[background-color,box-shadow,transform] duration-150",
            "bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
            "hover:bg-primary-hover hover:shadow-[0_4px_12px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.15)]",
            "active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
          )}
        >
          조회
        </button>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className={cn(
              "h-9 px-4 text-sm font-medium rounded-xl cursor-pointer",
              "transition-[color,background-color,transform] duration-150 active:scale-[0.97]",
              "bg-transparent text-muted hover:text-foreground hover:bg-card-hover",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "motion-reduce:transition-none motion-reduce:active:scale-100",
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
                "h-7 px-3 text-xs font-medium rounded-full cursor-pointer border",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activePresetKey === preset.key
                  ? "bg-primary border-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                  : // gray-100/gray-600 은 라이트 전용이라 다크에서 칩이 사라진다.
                    "bg-card-hover border-border text-muted hover:bg-primary-light hover:border-primary/30 hover:text-primary-ink",
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
