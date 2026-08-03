"use client";
import { useEffect, useState } from "react";

export interface UseImagePreloadOptions {
  /** 동시 미리 로드 개수 (기본 3) */
  concurrency?: number;
}

/**
 * 이미지 URL 배열을 백그라운드에서 미리 로드한다. 라이트박스 prev/next 등에서
 * 다음 사진 사전 로드용. 로딩이 끝난 URL set을 노출하므로 UI에서 ready 표시
 * 가능.
 *
 * @example
 *   const { loaded } = useImagePreload(visiblePhotos.slice(idx, idx + 3).map((p) => p.src));
 *   const ready = loaded.has(currentSrc);
 */
export function useImagePreload(urls: string[], { concurrency = 3 }: UseImagePreloadOptions = {}) {
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const queue = urls.slice();
    let active = 0;
    let cancelled = false;

    const tryNext = () => {
      while (active < concurrency && queue.length > 0) {
        const url = queue.shift()!;
        if (loaded.has(url) || failed.has(url)) continue;
        active++;
        const img = new Image();
        const done = (ok: boolean) => () => {
          if (cancelled) return;
          active--;
          if (ok) setLoaded((s) => (s.has(url) ? s : new Set(s).add(url)));
          else setFailed((s) => (s.has(url) ? s : new Set(s).add(url)));
          tryNext();
        };
        img.onload = done(true);
        img.onerror = done(false);
        img.src = url;
      }
    };
    tryNext();

    return () => {
      cancelled = true;
    };
    // urls is treated as the dependency boundary by reference — callers should
    // memoize if identity should be stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join("|"), concurrency]);

  return { loaded, failed };
}
