"use client";
import { cn } from "../../utils/cn";

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

export interface FilterButtonGroupProps {
  /** 필터 옵션 목록 */
  options: FilterOption[];
  /** 선택된 값 */
  value: string;
  /** 값 변경 콜백 */
  onChange: (key: string) => void;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 필터 버튼 그룹
 * @description 선택 가능한 필터 옵션을 연결된 버튼으로 표시하는 컴포넌트
 * @example
 * <FilterButtonGroup
 *   options={[
 *     { key: "all", label: "전체", count: 120 },
 *     { key: "active", label: "활성", count: 85 },
 *     { key: "inactive", label: "비활성", count: 35 },
 *   ]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 * @status stable
 * @since 2.2.0
 * @tags form, control
 */
export function FilterButtonGroup({ options, value, onChange, className }: FilterButtonGroupProps) {
  return (
    <div className={cn("inline-flex", className)} role="group">
      {options.map((option, index) => {
        const isActive = option.key === value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={cn(
              "relative h-9 px-4 text-sm font-medium border cursor-pointer whitespace-nowrap",
              "transition-[color,background-color,border-color,box-shadow] duration-150 ease-out",
              // 포커스 링이 이웃 버튼의 테두리 아래로 숨지 않도록 포커스 시에만 위로 올린다.
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:z-20",
              isFirst && "rounded-l-xl",
              isLast && "rounded-r-xl",
              !isFirst && !isLast && "rounded-none",
              !isFirst && "-ml-px",
              isActive
                ? "bg-primary text-white border-primary z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] active:bg-primary-hover"
                : "bg-card text-foreground border-border hover:bg-card-hover hover:border-muted-light/60 active:bg-muted/15",
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "ml-1.5 text-[10px] font-semibold tabular-nums",
                  isActive ? "text-white/80" : "text-muted",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
