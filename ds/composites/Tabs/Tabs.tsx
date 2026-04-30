"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

/** 개별 탭 정의 */
export interface Tab<T extends string = string> {
  /** 탭의 고유 값. onChange에 전달됩니다 */
  value: T;
  /** 탭에 표시되는 텍스트 */
  label: string;
  /**
   * 탭 아이콘 (라벨 왼쪽).
   * 탭의 의미를 시각적으로 보강할 때 사용합니다.
   *
   * @example icon={<MailIcon />}
   */
  icon?: ReactNode;
  /**
   * 탭 옆에 표시되는 숫자 뱃지.
   * 알림 수, 미읽은 항목 수 등을 표시할 때 사용합니다.
   *
   * @example badge={3}
   */
  badge?: number;
  /**
   * 비활성화 여부.
   * true이면 클릭 불가하며 흐리게 표시됩니다.
   *
   * @default false
   */
  disabled?: boolean;
}

/**
 * 탭 네비게이션 컴포넌트.
 *
 * underline(기본), pills, segment 3가지 스타일을 지원합니다.
 * 키보드 화살표 키로 탭 전환이 가능합니다.
 *
 * @example
 * const [tab, setTab] = useState("all");
 * <Tabs
 *   tabs={[{ value: "all", label: "전체" }, { value: "mine", label: "내 항목" }]}
 *   value={tab}
 *   onChange={setTab}
 * />
 */
export interface TabsProps<T extends string = string> {
  /**
   * 탭 목록.
   * 각 탭은 value, label을 필수로 가지며 icon, badge, disabled를 선택적으로 설정할 수 있습니다.
   */
  tabs: Tab<T>[];
  /** 현재 선택된 탭의 value. tabs 배열 내 하나의 value와 일치해야 합니다. */
  value: T;
  /**
   * 탭이 변경될 때 호출되는 콜백.
   * 새로 선택된 탭의 value가 인자로 전달됩니다.
   */
  onChange: (value: T) => void;
  /**
   * 탭 스타일 변형.
   * - `"underline"` — 하단 밑줄 스타일 (기본값). 일반 탭 네비게이션에 적합합니다.
   * - `"pills"` — 알약형 버튼 스타일. 필터, 토글 용도에 적합합니다.
   * - `"segment"` — iOS 세그먼트 컨트롤 스타일. 2~4개 옵션 전환에 적합합니다.
   *
   * @default "underline"
   */
  variant?: "underline" | "pills" | "segment";
  /**
   * 탭 크기.
   * - `"sm"` — 작은 크기 (좁은 공간, 보조 네비게이션)
   * - `"md"` — 기본 크기
   *
   * @default "md"
   */
  size?: "sm" | "md";
  /** 루트 요소에 추가할 CSS 클래스 */
  className?: string;
}

/**
 * 탭 네비게이션 컴포넌트.
 *
 * underline(기본), pills, segment 3가지 스타일을 지원합니다.
 * 키보드 화살표 키로 탭 전환이 가능합니다.
 *
 * @example
 * const [tab, setTab] = useState("all");
 * <Tabs
 *   tabs={[{ value: "all", label: "전체" }, { value: "mine", label: "내 항목" }]}
 *   value={tab}
 *   onChange={setTab}
 * />
 */
function TabsInner<T extends string = string>({
  tabs,
  value,
  onChange,
  variant = "underline",
  size = "md",
  className,
  innerRef,
}: TabsProps<T> & { innerRef?: React.Ref<HTMLDivElement> }) {
  if (variant === "segment") {
    return (
      <div ref={innerRef} className={cn("inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-0.5", className)} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={value === tab.value}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 font-medium transition-all duration-200 rounded-md cursor-pointer active:scale-95",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              value === tab.value
                ? "bg-white dark:bg-gray-700 text-foreground shadow-sm"
                : "text-muted hover:text-foreground/80",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                "rounded-full px-1.5 text-[10px] font-semibold",
                value === tab.value ? "bg-primary text-white" : "bg-gray-200 text-muted",
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div ref={innerRef} className={cn("inline-flex gap-1", className)} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={value === tab.value}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200 cursor-pointer active:scale-95",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              value === tab.value
                ? "bg-primary text-white shadow-md"
                : "text-muted hover:bg-gray-100 hover:text-foreground/80",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                "rounded-full px-1.5 text-[10px] font-semibold",
                value === tab.value ? "bg-white/20 text-white" : "bg-gray-200 text-muted",
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // underline (default)
  return (
    <div ref={innerRef} className={cn("flex border-b border-border gap-0", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          disabled={tab.disabled}
          onClick={() => onChange(tab.value)}
          className={cn(
            "inline-flex items-center gap-1.5 font-medium transition-all duration-200 border-b-[3px] -mb-px cursor-pointer active:scale-95",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm",
            value === tab.value
              ? "border-primary text-foreground"
              : "border-transparent text-muted hover:text-foreground/80 hover:border-gray-300",
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && (
            <span className={cn(
              "rounded-full px-1.5 text-[10px] font-semibold",
              value === tab.value ? "bg-primary-light text-primary" : "bg-gray-100 text-muted",
            )}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * 수평 탭 전환 컨트롤.
 * @example
 * <Tabs tabs={[{ id: "a", label: "A" }, { id: "b", label: "B" }]} value={tab} onChange={setTab} />
 * @status stable
 * @since 2.2.0
 * @tags navigation
 */
export function Tabs<T extends string = string>(
  props: TabsProps<T> & { ref?: React.Ref<HTMLDivElement> },
) {
  return <TabsInner {...props} innerRef={props.ref} />;
}

Tabs.displayName = "Tabs";
