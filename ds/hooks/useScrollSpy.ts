"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface UseScrollSpyOptions {
  /** 스크롤 위치 보정값 (px). 헤더 높이만큼 설정 권장 */
  offset?: number;
  /** IntersectionObserver threshold (0~1) */
  threshold?: number;
}

/**
 * 스크롤 위치 기반 활성 섹션 감지 훅
 *
 * IntersectionObserver와 scroll 이벤트를 결합하여
 * 현재 뷰포트에서 가장 가까운 섹션의 ID를 반환합니다.
 *
 * @param selectors - 관찰할 요소의 CSS 셀렉터 배열 또는 ID 배열
 * @param options - offset, threshold 설정
 * @returns 현재 활성 섹션의 ID (없으면 null)
 *
 * @example
 * ```tsx
 * const activeId = useScrollSpy(["intro", "features", "pricing"], { offset: 80 });
 * ```
 */
export function useScrollSpy(selectors: string[], options?: UseScrollSpyOptions): string | null {
  const { offset = 0, threshold = 0 } = options ?? {};

  const [activeId, setActiveId] = useState<string | null>(selectors[0] ?? null);
  const raf = useRef<number | null>(null);
  const manualUntil = useRef<number>(0);

  // selectors 배열이 변경될 때만 재계산
  const selectorKey = useMemo(() => selectors.join(","), [selectors]);

  // ToC 클릭 등 프로그래매틱 스크롤 시 잠시 스파이 비활성화
  useEffect(() => {
    const onManual = () => {
      manualUntil.current = Date.now() + 700;
    };
    window.addEventListener("scrollspy:manual", onManual);
    return () => window.removeEventListener("scrollspy:manual", onManual);
  }, []);

  useEffect(() => {
    if (!selectors.length) return;

    /**
     * 각 셀렉터에 해당하는 DOM 요소의 top 위치를 계산
     * - "#"으로 시작하면 CSS 셀렉터로 해석
     * - 그 외에는 ID로 해석
     */
    const getElements = () =>
      selectors
        .map((sel) => {
          const el =
            sel.startsWith("#") || sel.startsWith(".")
              ? document.querySelector(sel)
              : document.getElementById(sel);
          if (!el) return null;
          const id = el.id || sel.replace(/^#/, "");
          const top = el.getBoundingClientRect().top + window.scrollY;
          return { id, top };
        })
        .filter(Boolean)
        .sort((a, b) => a!.top - b!.top) as { id: string; top: number }[];

    let tops = getElements();

    const update = () => {
      raf.current = null;

      // 프로그래매틱 스크롤 중에는 관찰 중지
      if (Date.now() < manualUntil.current) return;

      const pos = window.scrollY + offset + 1;
      let current: string | null = tops[0]?.id ?? null;

      for (const t of tops) {
        if (t.top <= pos) current = t.id;
        else break;
      }

      // 페이지 바닥에서는 마지막 섹션을 강제 활성화
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
      if (nearBottom && tops.length) {
        current = tops[tops.length - 1].id;
      }

      setActiveId(current);
    };

    const onScroll = () => {
      if (raf.current == null) {
        raf.current = requestAnimationFrame(update);
      }
    };

    const onResize = () => {
      tops = getElements();
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // 초기 1회 실행
    tops = getElements();
    update();

    // IntersectionObserver를 보조 수단으로 사용
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && threshold > 0) {
      observer = new IntersectionObserver(
        () => {
          tops = getElements();
          update();
        },
        { threshold },
      );
      selectors.forEach((sel) => {
        const el =
          sel.startsWith("#") || sel.startsWith(".")
            ? document.querySelector(sel)
            : document.getElementById(sel);
        if (el) observer!.observe(el);
      });
    }

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectorKey, offset, threshold]);

  return activeId;
}
