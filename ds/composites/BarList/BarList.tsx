"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface BarListItem {
  /** 고유 키 (없으면 `label` 을 쓴다) */
  key?: string;
  /** 항목 이름 */
  label: string;
  /** 수치 */
  value: number;
  /** 이 항목만 다른 색으로 (CSS 색 문자열) */
  color?: string;
  /** 클릭 시 이동할 URL — 주면 행 전체가 링크가 된다 */
  href?: string;
}

export interface BarListProps extends HTMLAttributes<HTMLUListElement> {
  /** 표시할 항목들 */
  items: BarListItem[];
  /**
   * 막대 길이의 기준이 되는 최댓값.
   * 기본은 목록 안의 최댓값 — 여러 목록의 눈금을 맞추려면 직접 지정한다.
   */
  max?: number;
  /** 값 표시 형식 (기본: 그대로) */
  formatValue?: (value: number) => ReactNode;
  /** 상위 몇 개만 (기본: 전체) */
  limit?: number;
  /** 값 기준 내림차순 정렬 (기본 false — 넘긴 순서 유지) */
  sorted?: boolean;
  /** 막대 색 (CSS 색 문자열, 기본 `var(--primary)`) */
  color?: string;
}

/**
 * 가로 막대 순위 목록 — 이름 · 막대 · 수치 한 줄.
 *
 * "가장 많이 본 카테고리 상위 5개"처럼 **순위와 상대적 크기를 함께** 보여줄 때 쓴다.
 * `BarChart` 와 달리 SVG 가 아니라 평범한 목록이라, 라벨이 길면 자연스럽게
 * 잘리고 화면 폭에 따라 늘어난다.
 *
 * 막대는 장식이고 수치가 본문이다 — 스크린리더에는 "이름 값"으로만 읽히므로,
 * 막대를 못 보는 사용자도 같은 정보를 얻는다.
 *
 * @example
 * <BarList items={[{ label: "영화", value: 42 }, { label: "책", value: 17 }]} sorted limit={5} />
 * @status stable
 * @since 2.3.0
 * @tags data-display, chart
 */
export const BarList = forwardRef<HTMLUListElement, BarListProps>(function BarList(
  {
    items,
    max: maxProp,
    formatValue,
    limit,
    sorted = false,
    color = "var(--primary)",
    className,
    ...props
  },
  ref,
) {
  const ordered = sorted ? [...items].sort((a, b) => b.value - a.value) : items;
  const visible = limit ? ordered.slice(0, limit) : ordered;

  if (visible.length === 0) return null;

  // 0으로 나누는 것을 막는다 — 값이 전부 0이면 막대는 전부 비어 있다
  const max = maxProp ?? visible.reduce((m, i) => Math.max(m, i.value), 0) ?? 0;
  const denom = max || 1;

  return (
    <ul ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
      {visible.map((item) => {
        const pct = Math.max(0, Math.min(100, (item.value / denom) * 100));
        const row = (
          <>
            <span className="w-24 shrink-0 truncate text-xs text-muted">{item.label}</span>
            <span
              aria-hidden="true"
              className="h-2 flex-1 overflow-hidden rounded-full bg-card-hover ring-1 ring-border"
            >
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, background: item.color ?? color }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-foreground">
              {formatValue ? formatValue(item.value) : item.value}
            </span>
          </>
        );

        return (
          <li key={item.key ?? item.label}>
            {item.href ? (
              <a
                href={item.href}
                className="flex items-center gap-2 rounded-md px-1 py-0.5 no-underline transition-colors hover:bg-card-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                {row}
              </a>
            ) : (
              <div className="flex items-center gap-2 px-1 py-0.5">{row}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
});
