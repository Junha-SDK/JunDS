"use client";
import { useEffect, useRef, useState } from "react";

export interface UseReadingProgressOptions {
  /** 추적 대상 (없으면 window/document) */
  target?: HTMLElement | null;
  /** 진행률을 throttle할 ms (기본 50) */
  throttleMs?: number;
}

export interface UseReadingProgressResult {
  /** 현재 진행률 0–100 */
  progress: number;
  /** 화면에 보이는 첫 헤딩의 id (active section tracking) */
  activeHeadingId: string | null;
}

const HEADING_SELECTOR = "h1[id], h2[id], h3[id]";

/**
 * 글 읽기 진행률 + 현재 보이는 헤딩 추적.
 *
 * @example
 *   const { progress, activeHeadingId } = useReadingProgress();
 *   return (
 *     <>
 *       <ScrollProgress />
 *       <TableOfContents activeId={activeHeadingId ?? undefined} />
 *     </>
 *   );
 */
export function useReadingProgress({
  target,
  throttleMs = 50,
}: UseReadingProgressOptions = {}): UseReadingProgressResult {
  const [progress, setProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const lastTick = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const compute = () => {
      const now = Date.now();
      if (now - lastTick.current < throttleMs) return;
      lastTick.current = now;

      if (target) {
        const max = target.scrollHeight - target.clientHeight;
        setProgress(max > 0 ? Math.min(100, Math.max(0, (target.scrollTop / max) * 100)) : 0);
      } else {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        setProgress(max > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / max) * 100)) : 0);
      }

      const root = (target ?? document) as ParentNode;
      const headings = Array.from(root.querySelectorAll<HTMLElement>(HEADING_SELECTOR));
      if (headings.length > 0) {
        const offset = 80;
        let current: HTMLElement | null = null;
        for (const h of headings) {
          const top = h.getBoundingClientRect().top;
          if (top - offset <= 0) current = h;
          else break;
        }
        const next = current?.id ?? headings[0]?.id ?? null;
        setActiveHeadingId((prev) => (prev === next ? prev : next));
      }
    };

    compute();
    const handler = () => compute();
    const scrollSrc = (target ?? window) as Window | HTMLElement;
    scrollSrc.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      scrollSrc.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [target, throttleMs]);

  return { progress, activeHeadingId };
}
