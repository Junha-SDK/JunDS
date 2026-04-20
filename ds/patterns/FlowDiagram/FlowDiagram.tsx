"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface FlowNode {
  id: string;
  title: string;
  content?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  /** 연결할 대상 노드 ID 목록 */
  connections?: string[];
}

export interface FlowDiagramProps {
  nodes: FlowNode[];
  /** 노드 선택 핸들러 */
  onNodeClick?: (nodeId: string) => void;
  /** 선택된 노드 ID */
  selectedId?: string;
  /** 방향 */
  direction?: "horizontal" | "vertical";
  className?: string;
}

const variantBorder: Record<NonNullable<FlowNode["variant"]>, string> = {
  default: "border-gray-300 dark:border-gray-600",
  success: "border-green-500 dark:border-green-400",
  warning: "border-amber-500 dark:border-amber-400",
  danger: "border-red-500 dark:border-red-400",
  info: "border-blue-500 dark:border-blue-400",
};

const variantHeaderBg: Record<NonNullable<FlowNode["variant"]>, string> = {
  default: "bg-gray-50 dark:bg-gray-800",
  success: "bg-green-50 dark:bg-green-900/30",
  warning: "bg-amber-50 dark:bg-amber-900/30",
  danger: "bg-red-50 dark:bg-red-900/30",
  info: "bg-blue-50 dark:bg-blue-900/30",
};

const variantHeaderText: Record<NonNullable<FlowNode["variant"]>, string> = {
  default: "text-gray-700 dark:text-gray-200",
  success: "text-green-700 dark:text-green-300",
  warning: "text-amber-700 dark:text-amber-300",
  danger: "text-red-700 dark:text-red-300",
  info: "text-blue-700 dark:text-blue-300",
};

/** 화살표 커넥터 (수평) */
function HorizontalConnector() {
  return (
    <div className="flex items-center shrink-0 -mx-px">
      <div className="w-6 h-px bg-blue-400 dark:bg-blue-500" />
      <svg width="8" height="12" viewBox="0 0 8 12" className="shrink-0 -ml-px text-blue-400 dark:text-blue-500">
        <path d="M0 0 L8 6 L0 12" fill="currentColor" />
      </svg>
    </div>
  );
}

/** 화살표 커넥터 (수직) */
function VerticalConnector() {
  return (
    <div className="flex flex-col items-center shrink-0 -my-px">
      <div className="h-6 w-px bg-blue-400 dark:bg-blue-500" />
      <svg width="12" height="8" viewBox="0 0 12 8" className="shrink-0 -mt-px text-blue-400 dark:text-blue-500">
        <path d="M0 0 L6 8 L12 0" fill="currentColor" />
      </svg>
    </div>
  );
}

/** 입출력 포트 점 */
function PortDot({ side }: { side: "left" | "right" | "top" | "bottom" }) {
  const positionClass: Record<string, string> = {
    left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
    top: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  };

  return (
    <span
      className={cn(
        "absolute w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-gray-900",
        positionClass[side],
      )}
    />
  );
}

/**
 * 플로우 다이어그램
 * 프로세스 흐름을 노드와 연결선으로 시각화합니다.
 * @example
 * <FlowDiagram nodes={[
 *   { id: "1", title: "시작", connections: ["2"] },
 *   { id: "2", title: "처리", variant: "success", connections: ["3"] },
 *   { id: "3", title: "완료" },
 * ]} />
 */
export function FlowDiagram({
  nodes,
  onNodeClick,
  selectedId,
  direction = "horizontal",
  className,
}: FlowDiagramProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      className={cn(
        "flex items-center gap-0",
        isHorizontal ? "flex-row" : "flex-col",
        className,
      )}
    >
      {nodes.map((node, idx) => {
        const variant = node.variant ?? "default";
        const hasConnections = node.connections && node.connections.length > 0;
        const isSelected = selectedId === node.id;

        return (
          <div
            key={node.id}
            className={cn(
              "flex items-center gap-0",
              isHorizontal ? "flex-row" : "flex-col",
            )}
          >
            {/* Node card */}
            <div
              role={onNodeClick ? "button" : undefined}
              tabIndex={onNodeClick ? 0 : undefined}
              onClick={() => onNodeClick?.(node.id)}
              onKeyDown={(e) => {
                if (onNodeClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onNodeClick(node.id);
                }
              }}
              className={cn(
                "relative rounded-lg border-2 bg-white dark:bg-gray-900 shadow-sm min-w-[140px] max-w-[220px] overflow-hidden transition-all duration-150",
                variantBorder[variant],
                isSelected && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-950",
                onNodeClick && "cursor-pointer hover:shadow-md",
              )}
            >
              {/* Input port */}
              {idx > 0 && (
                <PortDot side={isHorizontal ? "left" : "top"} />
              )}

              {/* Output port */}
              {hasConnections && (
                <PortDot side={isHorizontal ? "right" : "bottom"} />
              )}

              {/* Header */}
              <div
                className={cn(
                  "px-3 py-2 border-b font-bold text-sm",
                  variantBorder[variant],
                  variantHeaderBg[variant],
                  variantHeaderText[variant],
                )}
              >
                {node.title}
              </div>

              {/* Content */}
              {node.content && (
                <div className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                  {node.content}
                </div>
              )}
            </div>

            {/* Connector arrow */}
            {hasConnections && idx < nodes.length - 1 && (
              isHorizontal ? <HorizontalConnector /> : <VerticalConnector />
            )}
          </div>
        );
      })}
    </div>
  );
}
