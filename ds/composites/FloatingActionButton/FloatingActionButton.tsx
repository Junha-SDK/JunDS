"use client";
import { cn } from "../../utils/cn";
import { useState } from "react";
import type { ReactNode } from "react";

export interface FloatingAction {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface FloatingActionButtonProps {
  actions: FloatingAction[];
  /** 위치 */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

const positionStyles: Record<NonNullable<FloatingActionButtonProps["position"]>, string> = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
};

const variantStyles: Record<NonNullable<FloatingAction["variant"]>, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 dark:shadow-blue-900/40",
  secondary: "bg-gray-600 text-white hover:bg-gray-700 shadow-gray-200 dark:shadow-gray-900/40",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-red-200 dark:shadow-red-900/40",
};

/**
 * 플로팅 액션 버튼 (FAB)
 * 고정 위치에서 빠른 액션을 제공합니다.
 * @example
 * <FloatingActionButton
 *   actions={[
 *     { key: "add", icon: <PlusIcon />, label: "추가", onClick: handleAdd },
 *     { key: "edit", icon: <EditIcon />, label: "편집", onClick: handleEdit, variant: "secondary" },
 *   ]}
 *   position="bottom-right"
 * />
 */
export function FloatingActionButton({
  actions,
  position = "bottom-right",
  className,
}: FloatingActionButtonProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const isBottom = position.startsWith("bottom");
  const isRight = position.endsWith("right");

  return (
    <div
      className={cn(
        "fixed z-40 flex flex-col gap-2",
        isBottom ? "flex-col-reverse" : "flex-col",
        positionStyles[position],
        className,
      )}
    >
      {actions.map((action, idx) => {
        const variant = action.variant ?? "primary";
        const isPrimary = idx === 0;

        return (
          <div
            key={action.key}
            className={cn(
              "relative flex items-center",
              isRight ? "justify-end" : "justify-start",
            )}
          >
            {/* 툴팁 */}
            {hoveredKey === action.key && (
              <div
                className={cn(
                  "absolute whitespace-nowrap px-2 py-1 text-xs font-medium rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-md pointer-events-none",
                  isRight ? "right-full mr-2" : "left-full ml-2",
                )}
              >
                {action.label}
              </div>
            )}

            {/* 버튼 */}
            <button
              type="button"
              onClick={action.onClick}
              onMouseEnter={() => setHoveredKey(action.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={cn(
                "inline-flex items-center justify-center rounded-full shadow-lg transition-all duration-200 cursor-pointer",
                "animate-[scaleIn_200ms_ease-out_forwards]",
                variantStyles[variant],
                isPrimary ? "w-14 h-14 text-lg" : "w-11 h-11 text-sm",
              )}
              style={{
                animationDelay: `${idx * 50}ms`,
                animationFillMode: "backwards",
              }}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          </div>
        );
      })}
    </div>
  );
}
