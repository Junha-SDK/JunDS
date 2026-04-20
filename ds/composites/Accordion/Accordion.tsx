"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface AccordionItem {
  key: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** 하나만 열기 모드 */
  single?: boolean;
  className?: string;
}

/**
 * 아코디언
 * @example
 * <Accordion items={[{key:"1",title:"FAQ",content:<p>답변</p>}]} />
 */
export function Accordion({ items, single, className }: AccordionProps) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    items.forEach((item) => { if (item.defaultOpen) defaults.add(item.key); });
    return defaults;
  });

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(single ? [] : prev);
      if (prev.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className={cn("divide-y divide-border border border-border rounded-xl overflow-hidden", className)}>
      {items.map((item) => {
        const isOpen = openKeys.has(item.key);
        const buttonId = `accordion-btn-${item.key}`;
        const panelId = `accordion-panel-${item.key}`;
        return (
          <div key={item.key}>
            <button
              id={buttonId}
              type="button"
              onClick={() => toggle(item.key)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground",
                "hover:bg-gray-50 transition-colors cursor-pointer text-left",
              )}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.title}
              </span>
              <svg
                className={cn("w-4 h-4 text-muted transition-transform duration-200", isOpen && "rotate-180")}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-all duration-200",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-3 text-sm text-muted">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
