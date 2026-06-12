"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface TocItem {
  /** 헤딩 ID */
  id: string;
  /** 헤딩 텍스트 */
  label: string;
  /** 레벨 (h1=1, h2=2, ...) */
  level: number;
}

export interface TableOfContentsProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 명시적 항목 (없으면 selector로 자동 수집) */
  items?: TocItem[];
  /** 자동 수집할 헤딩 셀렉터 */
  selector?: string;
  /** 컨테이너 셀렉터 (없으면 document) */
  rootSelector?: string;
  /** 활성 항목 추적 활성화 */
  activeTracking?: boolean;
  /** 상단 라벨 */
  title?: string;
  /** 클릭 시 부드러운 스크롤 */
  smooth?: boolean;
}

/**
 * 자동 생성 목차 (헤딩 수집 + IntersectionObserver 기반 활성 항목 추적).
 * @example
 * <TableOfContents selector="article h2, article h3" activeTracking />
 * @status stable
 * @since 2.3.0
 * @tags navigation
 */
export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>(function TableOfContents(
  {
    items: itemsProp,
    selector = "h2, h3",
    rootSelector,
    activeTracking = true,
    title = "목차",
    smooth = true,
    className,
    ...props
  },
  ref,
) {
  const [items, setItems] = useState<TocItem[]>(itemsProp ?? []);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (itemsProp) { setItems(itemsProp); return; }
    if (typeof document === "undefined") return;
    const root = rootSelector ? document.querySelector(rootSelector) : document;
    if (!root) return;
    const headings = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const list: TocItem[] = headings
      .filter((h) => h.id || h.textContent)
      .map((h) => {
        if (!h.id) {
          const slug = (h.textContent ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w가-힣-]/g, "");
          h.id = slug;
        }
        return {
          id: h.id,
          label: h.textContent?.trim() ?? h.id,
          level: parseInt(h.tagName.replace("H", ""), 10) || 2,
        };
      });
    setItems(list);
  }, [itemsProp, selector, rootSelector]);

  useEffect(() => {
    if (!activeTracking || items.length === 0 || typeof window === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items, activeTracking]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    if (!smooth) return;
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  };

  if (items.length === 0) return null;
  const minLevel = Math.min(...items.map((i) => i.level));

  return (
    <nav
      ref={ref}
      aria-label="목차"
      className={cn("text-sm", className)}
      {...props}
    >
      {title && <div className="mb-2 text-xs uppercase tracking-wider text-muted">{title}</div>}
      <ul className="flex flex-col gap-1">
        {items.map((it) => {
          const isActive = it.id === activeId;
          return (
            <li key={it.id} style={{ paddingLeft: (it.level - minLevel) * 12 }}>
              <a
                href={`#${it.id}`}
                onClick={(e) => handleClick(e, it.id)}
                className={cn(
                  "block py-0.5 truncate border-l-2 pl-2 transition-colors",
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted hover:text-foreground hover:border-border",
                )}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
