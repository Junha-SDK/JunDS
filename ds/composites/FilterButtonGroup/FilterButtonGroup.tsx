"use client";
import { cn } from "../../utils/cn";

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

export interface FilterButtonGroupProps {
  options: FilterOption[];
  value: string;
  onChange: (key: string) => void;
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
              "h-9 px-4 text-sm font-medium border transition-all duration-150 cursor-pointer",
              isFirst && "rounded-l-lg",
              isLast && "rounded-r-lg",
              !isFirst && !isLast && "rounded-none",
              !isFirst && "-ml-px",
              isActive
                ? "bg-primary text-white border-primary z-10 relative"
                : "bg-card text-foreground border-border hover:bg-gray-50",
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
