"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { HTMLAttributes } from "react";

export type MotionPreset =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "scale"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right";

const presetClass: Record<MotionPreset, string> = {
  fade: "animate-[mFade_300ms_ease-out_both]",
  "fade-up": "animate-[mFadeUp_350ms_cubic-bezier(0.16,1,0.3,1)_both]",
  "fade-down": "animate-[mFadeDown_350ms_cubic-bezier(0.16,1,0.3,1)_both]",
  scale: "animate-[mScale_280ms_cubic-bezier(0.16,1,0.3,1)_both]",
  "slide-up": "animate-[mSlideUp_400ms_cubic-bezier(0.16,1,0.3,1)_both]",
  "slide-down": "animate-[mSlideDown_400ms_cubic-bezier(0.16,1,0.3,1)_both]",
  "slide-left": "animate-[mSlideLeft_400ms_cubic-bezier(0.16,1,0.3,1)_both]",
  "slide-right": "animate-[mSlideRight_400ms_cubic-bezier(0.16,1,0.3,1)_both]",
};

export interface MotionProps extends HTMLAttributes<HTMLDivElement> {
  /** 애니메이션 프리셋 */
  preset?: MotionPreset;
  /** 진입 지연 (ms) */
  delay?: number;
  /** prefers-reduced-motion 대응 (기본 true: 즉시 표시) */
  respectReducedMotion?: boolean;
  /** 한 번만 실행 vs 매 마운트 (기본 단일 실행) */
  once?: boolean;
  /** 자식 (애니메이트할 컨텐츠) */
  children?: React.ReactNode;
}

/**
 * 모션 wrapper — CSS keyframe 기반 8가지 진입 프리셋. `prefers-reduced-motion`
 * 환경에서는 자동으로 애니메이션을 건너뛴다.
 *
 * @example
 *   <Motion preset="fade-up" delay={100}>
 *     <Card>안녕하세요</Card>
 *   </Motion>
 *
 * @status stable
 * @since 2.5.0
 * @tags motion, layout
 */
export const Motion = forwardRef<HTMLDivElement, MotionProps>(
  (
    { preset = "fade", delay, respectReducedMotion = true, className, style, children, ...props },
    ref,
  ) => {
    const reduced = useReducedMotion();
    const shouldAnimate = !(respectReducedMotion && reduced);
    return (
      <div
        ref={ref}
        // 훅은 마운트 후에야 결과를 안다 — 첫 페인트에서 한 번 튀는 것을 CSS 로 먼저 막는다
        className={cn(
          shouldAnimate && presetClass[preset],
          shouldAnimate && respectReducedMotion && "motion-reduce:animate-none",
          className,
        )}
        style={delay && shouldAnimate ? { animationDelay: `${delay}ms`, ...style } : style}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Motion.displayName = "Motion";
