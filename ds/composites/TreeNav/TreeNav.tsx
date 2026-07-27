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
  /**
   * 항목에 마우스를 올리거나 포커스가 닿았을 때 호출.
   * 해당 페이지의 청크를 미리 받아 두면 클릭 후 대기가 사라진다.
   */
  onItemPrefetch?: (key: string, href?: string) => void;
  /** 기본 확장 키 목록 */
  defaultExpanded?: string[];
  /**
   * 확장 상태를 바깥에서 제어할 때 쓴다.
   * 주면 `defaultExpanded` 는 무시되고 `onExpandedChange` 로만 상태가 바뀐다.
   */
  expandedKeys?: string[];
  /** 확장 상태가 바뀔 때 호출 (제어 모드) */
  onExpandedChange?: (keys: string[]) => void;
  /**
   * `activeKey` 로 가는 경로의 부모들을 자동으로 펼칠지 (기본 true).
   *
   * 딥링크로 들어왔을 때 현재 문서가 접힌 가지 안에 숨어 있으면 사용자는
   * 자기가 어디 있는지 알 수 없다.
   */
  autoExpandActive?: boolean;
  /**
   * `badge` 가 없는 부모 항목에 하위 잎 개수를 자동으로 표시할지 (기본 false).
   */
  showCount?: boolean;
  /** 전체 펼치기/접기 버튼을 상단에 보여줄지 (기본 false) */
  expandAllControl?: boolean;
  /** nav 의 접근성 라벨 */
  ariaLabel?: string;
  /** 추가 클래스 */
  className?: string;
}

/** 하위 잎(자식이 없는 항목) 개수를 센다 */
function countLeaves(item: TreeNavItem): number {
  if (!item.children?.length) return 1;
  return item.children.reduce((sum, c) => sum + countLeaves(c), 0);
}

/** activeKey 로 가는 경로상의 모든 조상 키를 모은다 */
function ancestorsOf(items: TreeNavItem[], target: string): string[] {
  const path: string[] = [];
  const walk = (nodes: TreeNavItem[], trail: string[]): boolean => {
    for (const node of nodes) {
      if (node.key === target) {
        path.push(...trail);
        return true;
      }
      if (node.children?.length && walk(node.children, [...trail, node.key])) {
        return true;
      }
    }
    return false;
  };
  walk(items, []);
  return path;
}

/** 자식이 있는 모든 항목의 키 */
function allBranchKeys(items: TreeNavItem[]): string[] {
  const out: string[] = [];
  const walk = (nodes: TreeNavItem[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        out.push(node.key);
        walk(node.children);
      }
    }
  };
  walk(items);
  return out;
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
  onItemPrefetch,
  showCount,
}: {
  item: TreeNavItem;
  depth: number;
  activeKey?: string;
  expanded: Record<string, boolean>;
  onToggle: (key: string) => void;
  onItemClick?: (key: string, href?: string) => void;
  onItemPrefetch?: (key: string, href?: string) => void;
  showCount?: boolean;
}) {
  const hasChildren = !!item.children?.length;
  const isOpen = !!expanded[item.key];
  const isActive = activeKey === item.key;
  const badge =
    item.badge ?? (showCount && hasChildren ? countLeaves(item) : undefined);

  const handleClick = () => {
    if (hasChildren) {
      onToggle(item.key);
    }
    onItemClick?.(item.key, item.href);
  };

  const handlePrefetch = onItemPrefetch
    ? () => onItemPrefetch(item.key, item.href)
    : undefined;

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
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
        onTouchStart={handlePrefetch}
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

        {badge != null && (
          <span
            className={cn(
              "ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
              "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
            )}
          >
            {badge}
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
              onItemPrefetch={onItemPrefetch}
              showCount={showCount}
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
 * @status stable
 * @since 2.2.0
 * @tags navigation
 */
export function TreeNav({
  items,
  activeKey,
  onItemClick,
  onItemPrefetch,
  defaultExpanded = [],
  expandedKeys,
  onExpandedChange,
  autoExpandActive = true,
  showCount = false,
  expandAllControl = false,
  ariaLabel = "트리 네비게이션",
  className,
}: TreeNavProps) {
  const controlled = expandedKeys != null;

  const initialExpanded = useMemo(() => {
    const map: Record<string, boolean> = {};
    defaultExpanded.forEach((key) => {
      map[key] = true;
    });
    return map;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [uncontrolled, setUncontrolled] =
    useState<Record<string, boolean>>(initialExpanded);

  // activeKey 로 가는 경로는 항상 펼쳐 둔다 — 딥링크로 들어온 사용자가
  // 접힌 가지 안에 숨은 현재 문서를 찾지 못하는 일을 막는다.
  const activeAncestors = useMemo(
    () => (autoExpandActive && activeKey ? ancestorsOf(items, activeKey) : []),
    [autoExpandActive, activeKey, items],
  );

  const expanded = useMemo(() => {
    const base: Record<string, boolean> = controlled
      ? Object.fromEntries(expandedKeys!.map((k) => [k, true]))
      : { ...uncontrolled };
    activeAncestors.forEach((k) => {
      base[k] = true;
    });
    return base;
  }, [controlled, expandedKeys, uncontrolled, activeAncestors]);

  const onToggle = useCallback(
    (key: string) => {
      if (controlled) {
        const next = expanded[key]
          ? expandedKeys!.filter((k) => k !== key)
          : [...expandedKeys!, key];
        onExpandedChange?.(next);
        return;
      }
      setUncontrolled((prev) => ({ ...prev, [key]: !expanded[key] }));
    },
    [controlled, expanded, expandedKeys, onExpandedChange],
  );

  const branches = useMemo(() => allBranchKeys(items), [items]);
  const allOpen = branches.length > 0 && branches.every((k) => expanded[k]);

  const toggleAll = useCallback(() => {
    const next = allOpen ? [] : branches;
    if (controlled) {
      onExpandedChange?.(next);
      return;
    }
    setUncontrolled(Object.fromEntries(next.map((k) => [k, true])));
  }, [allOpen, branches, controlled, onExpandedChange]);

  return (
    <nav className={cn("w-full", className)} aria-label={ariaLabel}>
      {expandAllControl && branches.length > 0 && (
        <button
          type="button"
          onClick={toggleAll}
          className="mb-1 w-full rounded-md px-2 py-1 text-left text-xs text-muted transition-colors hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800"
        >
          {allOpen ? "전체 접기" : "전체 펼치기"}
        </button>
      )}
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
            onItemPrefetch={onItemPrefetch}
            showCount={showCount}
          />
        ))}
      </ul>
    </nav>
  );
}
