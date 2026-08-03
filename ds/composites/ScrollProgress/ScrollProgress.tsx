"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { Slot, Slottable } from "../../utils/Slot";
import { useT } from "../../providers/I18nProvider";
import type { HTMLAttributes } from "react";

export interface ScrollProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 위치 */
  position?: "top" | "bottom";
  /** 색상 (CSS 값) */
  color?: string;
  /** 두께(px) */
  thickness?: number;
  /** 추적 대상 (없으면 window) */
  target?: HTMLElement | null;
  /** 스크린리더용 라벨 (기본 "페이지 스크롤 진행률") */
  "aria-label"?: string;
  /** root 엘리먼트를 자식 엘리먼트로 위임 (Slot 패턴) */
  asChild?: boolean;
}

/**
 * 페이지 읽기 진행률 바 (블로그 / 긴 문서).
 * @example
 * <ScrollProgress position="top" color="var(--primary)" thickness={3} />
 * @status stable
 * @since 2.3.0
 * @tags feedback
 */
export const ScrollProgress = forwardRef<HTMLDivElement, ScrollProgressProps>(
  function ScrollProgress(
    {
      position = "top",
      color,
      thickness = 3,
      target,
      asChild,
      className,
      style,
      "aria-label": ariaLabel,
      children,
      ...props
    },
    ref,
  ) {
    const t = useT();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      if (typeof window === "undefined") return;

      const compute = () => {
        const el = target;
        if (el) {
          const max = el.scrollHeight - el.clientHeight;
          setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
        } else {
          const doc = document.documentElement;
          const max = doc.scrollHeight - doc.clientHeight;
          setProgress(max > 0 ? (doc.scrollTop / max) * 100 : 0);
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
    }, [target]);

    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref as never}
        role="progressbar"
        aria-label={ariaLabel ?? t("ariaScrollProgress")}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "fixed left-0 right-0 z-50 pointer-events-none",
          position === "top" ? "top-0" : "bottom-0",
          className,
        )}
        style={{ height: thickness, ...style }}
        {...props}
      >
        {asChild ? <Slottable>{children}</Slottable> : null}
        <div
          // 폭이 스크롤을 따라 흐른다 — 감속 요청이면 스크롤 위치에 즉시 붙는다.
          className="h-full transition-[width] duration-100 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%`, background: color ?? "var(--primary)" }}
        />
      </Comp>
    );
  },
);
