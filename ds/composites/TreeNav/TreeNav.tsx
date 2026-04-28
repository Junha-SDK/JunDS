"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface TreeNavItem {
  /** 고유 키 */
  key: string;
  /** 표시 레이블 */
  label: string;
  /** 링크 URL */
  href?: string;
  /** 아이콘 */
  icon?: React.ReactNode;
  /** 하위 항목 */
  children?: TreeNavItem[];
  /** 배지 (숫자 또는 문자열) */
  badge?: number | string;
}

export interface TreeNavProps {
  /** 트리 항목 목록 */
  items: TreeNavItem[];
  /** 현재 활성 항목 키 */
  activeKey?: string;
  /** 항목 클릭 핸들러 */
  onItemClick?: (key: string, href?: string) => void;
  /** 기본 확장 키 목록 */
  defaultExpanded?: string[];
  className?: string;
}

/** 셰브론(화살표) SVG 아이콘 */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        "shrink-0 transition-transform duration-200",
        open && "rotate-90",
      )}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

/**
 * 재귀적 트리 노드 렌더링 컴포넌트
 */
function TreeNavNode({
  item,
  depth,
  activeKey,
  expanded,
  onToggle,
  onItemClick,
}: {
  item: TreeNavItem;
  depth: number;
  activeKey?: string;
  expanded: Record<string, boolean>;
  onToggle: (key: string) => void;
  onItemClick?: (key: string, href?: string) => void;
}) {
  const hasChildren = !!item.children?.length;
  const isOpen = !!expanded[item.key];
  const isActive = activeKey === item.key;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(item.key);
    }
    onItemClick?.(item.key, item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <li className="list-none">
      <div
        role={hasChildren ? "treeitem" : "treeitem"}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-selected={isActive}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          isActive &&
            "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
          !isActive && "text-neutral-600 dark:text-neutral-400",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren && <ChevronIcon open={isOpen} />}

        {!hasChildren && (
          <span className="inline-block w-4 shrink-0" aria-hidden="true" />
        )}

        {item.icon && <span className="shrink-0">{item.icon}</span>}

        <span className="flex-1 truncate">{item.label}</span>

        {item.badge != null && (
          <span
            className={cn(
              "ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
              "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
            )}
          >
            {item.badge}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <ul role="group" className="overflow-hidden">
          {item.children!.map((child) => (
            <TreeNavNode
              key={child.key}
              item={child}
              depth={depth + 1}
              activeKey={activeKey}
              expanded={expanded}
              onToggle={onToggle}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * 트리 네비게이션 컴포넌트
 *
 * 재귀적으로 트리 구조를 렌더링하며, 확장/접기, 활성 항목 표시,
 * 배지 카운트, 깊이 기반 들여쓰기를 지원합니다.
 *
 * @example
 * ```tsx
 * const items: TreeNavItem[] = [
 *   {
 *     key: "docs",
 *     label: "문서",
 *     badge: 12,
 *     children: [
 *       { key: "getting-started", label: "시작하기", href: "/docs/start" },
 *       { key: "api", label: "API 레퍼런스", href: "/docs/api" },
 *     ],
 *   },
 * ];
 *
 * <TreeNav
 *   items={items}
 *   activeKey="getting-started"
 *   defaultExpanded={["docs"]}
 *   onItemClick={(key, href) => router.push(href!)}
 * />
 * ```
 */
export function TreeNav({
  items,
  activeKey,
  onItemClick,
  defaultExpanded = [],
  className,
}: TreeNavProps) {
  const initialExpanded = useMemo(() => {
    const map: Record<string, boolean> = {};
    defaultExpanded.forEach((key) => {
      map[key] = true;
    });
    return map;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    initialExpanded,
  );

  const onToggle = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <nav className={cn("w-full", className)} aria-label="트리 네비게이션">
      <ul role="tree" className="space-y-0.5">
        {items.map((item) => (
          <TreeNavNode
            key={item.key}
            item={item}
            depth={0}
            activeKey={activeKey}
            expanded={expanded}
            onToggle={onToggle}
            onItemClick={onItemClick}
          />
        ))}
      </ul>
    </nav>
  );
}
