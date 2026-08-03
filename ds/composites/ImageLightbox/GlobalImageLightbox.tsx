"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils";

export interface GlobalImageLightboxProps {
  /**
   * 이 셀렉터 안의 이미지만 확대 대상으로 삼는다 (기본: 문서 전체).
   * 본문 영역을 지정하면 헤더 로고·아바타 같은 걸 잘못 잡지 않는다.
   */
  rootSelector?: string;
  /** 이 크기(px) 미만의 이미지는 무시한다 — 아이콘·뱃지 거르기 (기본 80) */
  minSize?: number;
  /** 이 셀렉터에 걸리는 이미지는 제외한다 */
  exclude?: string;
  /** 닫기 버튼 접근성 라벨 */
  closeLabel?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 본문 안의 이미지를 클릭하면 확대해 주는 전역 라이트박스.
 *
 * 이미지마다 컴포넌트를 감싸는 `ImageLightbox` 와 달리, 문서에 한 번만 두고
 * 클릭을 위임받아 처리한다. 마크다운을 HTML 문자열로 굳혀서 넣는 파이프라인처럼
 * 이미지 하나하나를 React 로 감쌀 수 없는 본문에 쓴다.
 *
 * 아이콘·아바타 같은 작은 이미지까지 확대되면 성가시므로 `minSize` 미만은
 * 무시한다. 렌더된 크기와 원본 크기를 모두 보므로, CSS 로 줄여 놓은 큰 이미지도
 * 걸러진다.
 *
 * @example
 * <GlobalImageLightbox rootSelector=".article__body" />
 * @status stable
 * @since 2.3.0
 * @tags media, overlay
 */
export function GlobalImageLightbox({
  rootSelector,
  minSize = 80,
  exclude,
  closeLabel = "닫기",
  className,
}: GlobalImageLightboxProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  const close = useCallback(() => setSrc(null), []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (rootSelector && !target.closest(rootSelector)) return;
      if (exclude && target.matches(exclude)) return;

      // 원본이 작으면 확대할 게 없고, 렌더 크기가 작으면 아이콘 취급이다.
      // 둘 다 봐야 "CSS 로 줄여 둔 큰 이미지"도 걸러진다.
      if (target.naturalWidth < minSize && target.naturalHeight < minSize) return;
      if (target.width < minSize && target.height < minSize) return;

      e.preventDefault();
      e.stopPropagation();
      setSrc(target.currentSrc || target.src);
      setAlt(target.alt ?? "");
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [rootSelector, minSize, exclude]);

  // 열려 있는 동안 Escape 로 닫고 배경 스크롤을 잠근다
  useEffect(() => {
    if (!src || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [src, close]);

  if (!src || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "이미지 확대 보기"}
      onClick={close}
      className={cn(
        // bg-black/85 는 라이트박스 크롬이다 — 모드와 무관하게 어두워야 사진이 산다.
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-6",
        "animate-fade-in motion-reduce:animate-none",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        decoding="async"
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full object-contain rounded-lg shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)] animate-fade-in-scale motion-reduce:animate-none"
      />
      <button
        type="button"
        onClick={close}
        aria-label={closeLabel}
        className={cn(
          "absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-2xl leading-none text-white",
          "bg-white/10 ring-1 ring-white/15 backdrop-blur-sm",
          "transition-colors hover:bg-white/20 active:bg-white/25",
          // 어두운 크롬 위라 링 오프셋도 검정이어야 링이 떠 보인다.
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/60",
        )}
      >
        &times;
      </button>
    </div>,
    document.body,
  );
}
