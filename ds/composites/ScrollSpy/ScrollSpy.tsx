"use client";
import { useState, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface ScrollSpySection {
  key: string;
  label: string;
  targetId: string;
}

export interface ScrollSpyProps {
  /** 추적할 섹션 목록 */
  sections: ScrollSpySection[];
  /** 활성 판정 오프셋(px) */
  offset?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 스크롤 위치 기반 네비게이션 인디케이터
 * @description 현재 보이는 섹션을 하이라이트하는 사이드 네비게이션을 제공합니다.
 * @example
 * <ScrollSpy sections={[{ key: "intro", label: "소개", targetId: "section-intro" }]} />
 * @status stable
 * @since 2.2.0
 * @tags navigation
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
      // 부드러운 스크롤은 화면 전체가 흐르는 움직임이다 — 감속 요청이면 즉시 점프한다.
      // (JS 의 behavior 는 CSS 변형으로 못 막으니 여기서 직접 본다)
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
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
          aria-current={activeKey === section.key ? "true" : undefined}
          className={cn(
            "text-left px-3 py-1.5 text-sm rounded-lg border-l-2 cursor-pointer truncate",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            activeKey === section.key
              ? "border-primary text-primary-ink font-medium bg-primary-light"
              : // hover:bg-gray-50 은 라이트 전용 — 카드 호버 토큰이 모드를 따라간다.
                "border-transparent text-muted hover:text-foreground hover:bg-card-hover",
          )}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
