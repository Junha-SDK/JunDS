"use client";
import { useState, forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ImgHTMLAttributes } from "react";

export interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "onError" | "onLoad"> {
  /** 대체 이미지 URL */
  fallbackSrc?: string;
  /** 로딩 중 스켈레톤 표시 */
  showSkeleton?: boolean;
  /** 종횡비 */
  aspectRatio?: string;
  /** 컨테이너 클래스 */
  containerClassName?: string;
}

/**
 * 이미지 + 스켈레톤 + 에러 폴백 — 로드 실패 시 대체 이미지/플레이스홀더 표시.
 * @example
 * <ImageWithFallback src={p.url} alt={p.title} fallbackSrc="/placeholder.png" aspectRatio="1/1" />
 * @status stable
 * @since 2.4.0
 * @tags photo, media
 */
export const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ src, alt, fallbackSrc, showSkeleton = true, aspectRatio = "1/1", containerClassName, className, ...props }, ref) => {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
    const finalSrc = status === "error" && fallbackSrc ? fallbackSrc : src;

    return (
      <div className={cn("relative overflow-hidden bg-gray-100 dark:bg-gray-800", containerClassName)} style={{ aspectRatio }}>
        {showSkeleton && status === "loading" && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
        )}
        {status === "error" && !fallbackSrc && (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-xs">
            🖼 이미지 없음
          </div>
        )}
        {finalSrc && (
          <img
            ref={ref}
            src={finalSrc}
            alt={alt}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
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
