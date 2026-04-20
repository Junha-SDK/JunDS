"use client";
import { useState, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface ScrollSpySection {
  key: string;
  label: string;
  targetId: string;
}

export interface ScrollSpyProps {
  sections: ScrollSpySection[];
  offset?: number;
  className?: string;
}

/**
 * 스크롤 위치 기반 네비게이션 인디케이터
 * @description 현재 보이는 섹션을 하이라이트하는 사이드 네비게이션을 제공합니다.
 * @example
 * <ScrollSpy sections={[{ key: "intro", label: "소개", targetId: "section-intro" }]} />
 */
export function ScrollSpy({ sections, offset = 80, className }: ScrollSpyProps) {
  const [activeKey, setActiveKey] = useState<string>(sections[0]?.key ?? "");

  useEffect(() => {
    const elements = sections
      .map((s) => ({ key: s.key, el: document.getElementById(s.targetId) }))
      .filter((item): item is { key: string; el: HTMLElement } => item.el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const match = elements.find((item) => item.el === visible[0].target);
          if (match) setActiveKey(match.key);
        }
      },
      { rootMargin: `-${offset}px 0px -40% 0px`, threshold: 0 },
    );

    elements.forEach((item) => observer.observe(item.el));
    return () => observer.disconnect();
  }, [sections, offset]);

  const handleClick = useCallback(
    (targetId: string) => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    },
    [offset],
  );

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="섹션 네비게이션">
      {sections.map((section) => (
        <button
          key={section.key}
          type="button"
          onClick={() => handleClick(section.targetId)}
          className={cn(
            "text-left px-3 py-1.5 text-sm rounded-md transition-colors border-l-2",
            activeKey === section.key
              ? "border-primary text-primary font-medium bg-primary/5"
              : "border-transparent text-muted hover:text-foreground hover:bg-gray-50",
          )}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
