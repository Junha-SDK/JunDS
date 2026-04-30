"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface TreeNode {
  key: string;
  label: string;
  icon?: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps {
  /** 트리 노드 */
  nodes: TreeNode[];
  /** 선택된 노드 ID */
  selected?: string;
  /** 노드 선택 콜백 */
  onSelect?: (key: string) => void;
  /** 기본으로 펼쳐진 노드 ID 배열 */
  defaultExpanded?: string[];
  /** 추가 클래스 */
  className?: string;
}

/**
 * 트리뷰 컴포넌트 — 파일 탐색기 스타일의 트리 구조
 * @example
 * <TreeView
 *   nodes={[{ key:"1", label:"폴더", children:[{ key:"2", label:"파일" }] }]}
 *   selected={selected}
 *   onSelect={setSelected}
 * />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function TreeView({ nodes, selected, onSelect, defaultExpanded = [], className }: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded));

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderNode = (node: TreeNode, depth: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.key);
    const isSelected = selected === node.key;

    return (
      <div key={node.key}>
        <button
          type="button"
          disabled={node.disabled}
          onClick={() => {
            if (hasChildren) toggle(node.key);
            if (!node.disabled) onSelect?.(node.key);
          }}
          className={cn(
            "w-full flex items-center gap-1.5 px-2 py-1 text-sm rounded-md transition-colors cursor-pointer text-left",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            isSelected ? "bg-primary-light text-primary font-medium" : "text-foreground hover:bg-gray-100",
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* 펼침/접힘 화살표 */}
          {hasChildren ? (
            <svg
              className={cn("w-4 h-4 shrink-0 text-muted transition-transform duration-200", isExpanded && "rotate-90")}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          {node.icon && <span className="shrink-0">{node.icon}</span>}
          <span className="truncate">{node.label}</span>
        </button>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("py-1", className)} role="tree">
      {nodes.map((node) => renderNode(node, 0))}
    </div>
  );
}
