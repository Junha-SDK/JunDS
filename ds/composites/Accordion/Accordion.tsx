"use client";
import { useState, forwardRef } from "react";
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
  /** 아코디언 항목 목록 */
  items: AccordionItem[];
  /** 하나만 열기 모드 */
  single?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 아코디언
 * @example
 * <Accordion items={[{key:"1",title:"FAQ",content:<p>답변</p>}]} />
 * @status stable
 * @since 2.2.0
 * @tags disclosure
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, single, className }, ref) => {
    const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
      const defaults = new Set<string>();
      items.forEach((item) => {
        if (item.defaultOpen) defaults.add(item.key);
      });
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
      <div
        ref={ref}
        className={cn(
          "divide-y divide-border border border-border rounded-xl overflow-hidden",
          className,
        )}
      >
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
                  "w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground",
                  "transition-colors hover:bg-card-hover active:bg-muted/10 cursor-pointer text-left",
                  // 컨테이너가 overflow-hidden 이라 바깥 링은 잘린다 — 안쪽으로 그린다.
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                </span>
                <svg
                  className={cn(
                    "w-4 h-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none",
                    isOpen && "rotate-180",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  // `all` 은 안쪽 padding·font-size 까지 전이 대상으로 삼는다.
                  // 여기서 실제로 변하는 건 행 높이와 투명도 둘뿐이라 그것만 지목한다.
                  "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
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
  },
);
Accordion.displayName = "Accordion";
