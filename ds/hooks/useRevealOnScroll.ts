"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export interface UseRevealOnScrollOptions {
  /** 관찰 대상 셀렉터 (기본 `".jds-reveal"`) */
  selector?: string;
  /** 화면에 들어왔을 때 붙일 클래스 (기본 `"is-visible"`) */
  visibleClassName?: string;
  /** IntersectionObserver rootMargin (기본 `"0px 0px -8% 0px"`) */
  rootMargin?: string;
  /** IntersectionObserver threshold (기본 0.08) */
  threshold?: number;
  /** 한 번 보인 뒤 다시 숨기지 않음 (기본 true) */
  once?: boolean;
}

/**
 * 스크롤 진입 시 자식 요소에 `is-visible` 클래스를 붙여 주는 훅.
 *
 * 반환된 ref 를 컨테이너에 걸면, 그 안의 `selector` 에 해당하는 요소들이
 * 뷰포트에 들어오는 순간 클래스가 붙는다. 실제 등장 애니메이션은 CSS 쪽에
 * 맡기므로 (`.jds-reveal { opacity: 0 } .jds-reveal.is-visible { opacity: 1 }`)
 * 어떤 모션을 줄지는 호출부가 자유롭게 정한다.
 *
 * `prefers-reduced-motion: reduce` 이거나 IntersectionObserver 가 없는 환경
 * (구형 브라우저·SSR 이후 하이드레이션 실패 등)에서는 관찰 없이 전부 즉시
 * 보이게 만들어, 모션을 끈 사용자에게 콘텐츠가 영영 숨는 일이 없게 한다.
 *
 * 요소 하나만 관찰하면 되는 경우에는 `useIntersectionObserver` 가 더 적합하다.
 *
 * @example
 * ```tsx
 * const ref = useRevealOnScroll();
 * return (
 *   <section ref={ref}>
 *     <div className="jds-reveal">첫 번째</div>
 *     <div className="jds-reveal">두 번째</div>
 *   </section>
 * );
 * ```
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOnScrollOptions = {},
): RefObject<T | null> {
  const {
    selector = ".jds-reveal",
    visibleClassName = "is-visible",
    rootMargin = "0px 0px -8% 0px",
    threshold = 0.08,
    once = true,
  } = options;

  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(`${selector}:not(.${visibleClassName})`),
    );
    if (!targets.length) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add(visibleClassName));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(visibleClassName);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove(visibleClassName);
          }
        });
      },
      { rootMargin, threshold },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector, visibleClassName, rootMargin, threshold, once]);

  return ref;
}
