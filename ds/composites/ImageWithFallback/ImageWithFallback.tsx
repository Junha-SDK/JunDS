"use client";
import { useCallback, useEffect, useRef, useState, forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ImgHTMLAttributes, ReactNode } from "react";

export interface ImageWithFallbackProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "onError" | "onLoad"> {
  /** 대체 이미지 URL */
  fallbackSrc?: string;
  /** 대체 이미지 대신 렌더할 노드 (`fallbackSrc` 보다 우선) */
  fallback?: ReactNode;
  /** 로딩 중 스켈레톤 표시 */
  showSkeleton?: boolean;
  /** 종횡비 */
  aspectRatio?: string;
  /** 컨테이너 클래스 */
  containerClassName?: string;
  /**
   * 로드 실패 시 빠른 재시도 횟수 (기본 0 = 재시도 안 함).
   *
   * 0.5s → 1s → 2s 지수 백오프로 다시 요청한다. 이 구간에는 폴백 대신 스켈레톤이
   * 계속 보이므로, 네트워크가 잠깐 흔들린 경우 사용자는 아무 일도 없었던 것처럼
   * 이미지를 보게 된다. 외부 호스트의 이미지라면 `3` 정도를 권한다.
   */
  retry?: number;
  /**
   * 폴백이 뜬 뒤에도 백그라운드에서 소생을 계속 시도할지 (기본 false).
   *
   * 오프스크린 `new Image()` 프로브로 5s → 15s → 45s → 2m → 5m(이후 반복) 주기로
   * 확인하고, 네트워크 복구(`online`)나 탭 복귀(`visibilitychange`) 시에는 즉시
   * 다시 시도한다. 프로브가 성공하면 브라우저 캐시가 데워진 뒤 같은 URL 로
   * 교체되므로 깜빡임 없이 이미지가 나타난다.
   *
   * 이미지 호스트가 잠시 흔들렸을 때 새로고침 전까지 영영 폴백으로 굳는 문제를
   * 막는다. DOM 의 `<img>` 를 건드리지 않아 폴백 ↔ 스켈레톤이 깜빡이지 않는다.
   */
  revive?: boolean;
}

/** 빠른 재시도 백오프의 기준 간격 */
const QUICK_BASE_MS = 500;
/** 폴백 표시 후 소생 프로브 주기. 마지막 값은 무한 반복된다 */
const REVIVE_DELAYS_MS = [5_000, 15_000, 45_000, 120_000, 300_000];

/** 재시도 시 캐시된 실패 응답을 우회한다. data: URI 는 건드리지 않는다 */
function withRetryParam(src: string, attempt: number): string {
  if (attempt === 0 || src.startsWith("data:")) return src;
  return `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`;
}

/**
 * 이미지 + 스켈레톤 + 에러 폴백 — 로드 실패 시 대체 이미지/플레이스홀더 표시.
 *
 * `retry` / `revive` 를 켜면 일시적 실패에 훨씬 끈질기게 대응한다.
 * 자세한 동작은 각 prop 설명 참고.
 *
 * @example
 * <ImageWithFallback src={p.url} alt={p.title} fallbackSrc="/placeholder.png" aspectRatio="1/1" />
 * @example
 * // 외부 호스트 이미지 — 흔들려도 끝까지 되살린다
 * <ImageWithFallback src={cover} retry={3} revive fallback={<CategoryLabel />} />
 * @status stable
 * @since 2.4.0
 * @tags photo, media
 */
export const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  (
    {
      src,
      alt,
      fallbackSrc,
      fallback,
      showSkeleton = true,
      aspectRatio = "1/1",
      containerClassName,
      className,
      retry = 0,
      revive = false,
      ...props
    },
    ref,
  ) => {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
    // 0 = 원본, >0 = 캐시버스터를 붙인 재요청
    const [attempt, setAttempt] = useState(0);

    // 재시도 카운터는 렌더와 무관하게 동기적으로 세야 하므로 ref
    const quickRetriesRef = useRef(0);
    const attemptCounterRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // React 19 는 `src` 로 Blob 계열도 허용한다. 재시도/소생은 URL 문자열을
    // 조작해야 하므로, 문자열일 때만 그 경로를 탄다.
    const srcUrl = typeof src === "string" ? src : undefined;

    // src 가 바뀌면(리스트에서 인스턴스가 재사용되는 등) 상태를 초기화한다
    useEffect(() => {
      quickRetriesRef.current = 0;
      attemptCounterRef.current = 0;
      setAttempt(0);
      setStatus("loading");
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [src]);

    // 소생 루프 — 폴백이 떠 있는 동안 오프스크린 프로브로 계속 확인한다
    useEffect(() => {
      if (!revive || status !== "error") return;
      if (!srcUrl || srcUrl.startsWith("data:")) return;

      let disposed = false;
      let probing = false;
      let reviveIdx = 0;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const schedule = () => {
        const delay = REVIVE_DELAYS_MS[Math.min(reviveIdx, REVIVE_DELAYS_MS.length - 1)];
        reviveIdx += 1;
        timer = setTimeout(probe, delay);
      };

      const probe = () => {
        if (disposed || probing) return;
        // 오프라인이면 시도해도 무의미 — online 이벤트가 다시 깨워준다
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          schedule();
          return;
        }
        probing = true;
        const n = ++attemptCounterRef.current;
        const probeImg = new Image();
        probeImg.onload = () => {
          probing = false;
          if (disposed) return;
          // 프로브가 캐시를 데워 놨으므로 같은 URL 로 교체하면 즉시 뜬다
          setAttempt(n);
          setStatus("loading");
        };
        probeImg.onerror = () => {
          probing = false;
          if (disposed) return;
          schedule();
        };
        probeImg.src = withRetryParam(srcUrl, n);
      };

      const reviveNow = () => {
        if (timer) clearTimeout(timer);
        probe();
      };
      const onOnline = () => reviveNow();
      const onVisible = () => {
        if (document.visibilityState === "visible") reviveNow();
      };

      window.addEventListener("online", onOnline);
      document.addEventListener("visibilitychange", onVisible);
      schedule();

      return () => {
        disposed = true;
        if (timer) clearTimeout(timer);
        window.removeEventListener("online", onOnline);
        document.removeEventListener("visibilitychange", onVisible);
      };
    }, [revive, status, srcUrl]);

    const handleError = useCallback(() => {
      if (quickRetriesRef.current >= retry) {
        setStatus("error");
        return;
      }
      quickRetriesRef.current += 1;
      const n = ++attemptCounterRef.current;
      const delay = QUICK_BASE_MS * 2 ** (quickRetriesRef.current - 1);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setAttempt(n), delay);
    }, [retry]);

    const failed = status === "error";
    const finalSrc = failed && fallbackSrc
      ? fallbackSrc
      : srcUrl
        ? withRetryParam(srcUrl, attempt)
        : src;
    const showCustomFallback = failed && !fallbackSrc && fallback != null;

    return (
      <div
        className={cn("relative overflow-hidden bg-gray-100 dark:bg-gray-800", containerClassName)}
        style={{ aspectRatio }}
      >
        {showSkeleton && status === "loading" && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
        )}
        {showCustomFallback && <div className="absolute inset-0">{fallback}</div>}
        {failed && !fallbackSrc && fallback == null && (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-xs">
            🖼 이미지 없음
          </div>
        )}
        {finalSrc && !showCustomFallback && (
          <img
            // attempt 가 바뀌면 img 를 재마운트해 새 요청을 확실히 발생시킨다
            key={attempt}
            ref={ref}
            src={finalSrc}
            alt={alt}
            onLoad={() => setStatus("loaded")}
            onError={handleError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              status === "loaded" ? "opacity-100" : "opacity-0",
              className,
            )}
            {...props}
          />
        )}
      </div>
    );
  },
);
ImageWithFallback.displayName = "ImageWithFallback";
