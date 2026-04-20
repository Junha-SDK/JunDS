"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface TimelineItem {
  key: string;
  title: string;
  description?: string | ReactNode;
  time?: string;
  icon?: ReactNode;
  color?: "primary" | "success" | "warning" | "danger" | "neutral";
}

export interface TimelineProps {
  items: TimelineItem[];
  /** 연결선 스타일 */
  lineStyle?: "solid" | "dashed";
  className?: string;
}

const dotColors = {
  primary: "bg-primary border-primary-light",
  success: "bg-success border-success-light",
  warning: "bg-warning border-warning-light",
  danger: "bg-danger border-danger-light",
  neutral: "bg-gray-400 border-gray-200",
};

/**
 * 타임라인
 * @example
 * <Timeline items={[
 *   { key:"1", title:"생성", time:"10:00", color:"primary" },
 *   { key:"2", title:"진행 시작", time:"11:30", color:"success" },
 * ]} />
 */
export function Timeline({ items, lineStyle = "solid", className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const color = item.color || "neutral";
        return (
          <div key={item.key} className="flex gap-3 pb-6 last:pb-0">
            {/* Dot + Line */}
            <div className="flex flex-col items-center">
              {item.icon ? (
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0", dotColors[color].split(" ")[0])}>
                  {item.icon}
                </div>
              ) : (
                <div className={cn("w-3 h-3 rounded-full border-2 shrink-0 mt-1", dotColors[color])} />
              )}
              {!isLast && (
                <div className={cn(
                  "w-px flex-1 mt-1",
                  lineStyle === "dashed" ? "border-l border-dashed border-border" : "bg-border",
                )} />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pt-px">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.title}</span>
                {item.time && <span className="text-[10px] text-muted-light">{item.time}</span>}
              </div>
              {item.description && (
                <div className="text-xs text-muted mt-0.5">{item.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
