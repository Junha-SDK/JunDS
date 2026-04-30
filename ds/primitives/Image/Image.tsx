"use client";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import type { ImgHTMLAttributes, ReactNode } from "react";

export type ImageFit = "cover" | "contain" | "fill" | "none" | "scale-down";

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** object-fit 모드 */
  fit?: ImageFit;
  /** 라운드 코너 */
  radius?: "none" | "sm" | "md" | "lg" | "full";
  /** 종횡비 (예: "16/9", "1/1") */
  ratio?: string;
  /** 로딩 중 placeholder */
  placeholder?: ReactNode;
  /** 로드 실패 시 fallback */
  fallback?: ReactNode;
}

const radiusClass = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const;

const fitClass: Record<ImageFit, string> = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
  "scale-down": "object-scale-down",
};

/**
 * 로드 실패/로딩 상태를 처리하는 이미지 프리미티브.
 * @example
 * <Image src="/x.png" alt="x" ratio="16/9" radius="md" />
 * @status stable
 * @since 2.3.0
 * @tags media
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    fit = "cover",
    radius = "none",
    ratio,
    placeholder,
    fallback,
    className,
    onLoad,
    onError,
    src,
    alt,
    style,
    ...props
  },
  ref,
) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error",
  );

  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  if (status === "error" && fallback !== undefined) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-soft text-muted text-xs",
          radiusClass[radius],
          className,
        )}
        style={ratio ? { aspectRatio: ratio, ...style } : style}
        role="img"
        aria-label={alt}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", radiusClass[radius], className)}
      style={ratio ? { aspectRatio: ratio, ...style } : style}
    >
      {status === "loading" && placeholder !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-soft">
          {placeholder}
        </div>
      )}
      <img
        ref={ref}
        src={src}
        alt={alt ?? ""}
        className={cn(
          "w-full h-full transition-opacity",
          fitClass[fit],
          status === "loaded" ? "opacity-100" : "opacity-0",
        )}
        onLoad={(e) => {
          setStatus("loaded");
          onLoad?.(e);
        }}
        onError={(e) => {
          setStatus("error");
          onError?.(e);
        }}
        {...props}
      />
    </div>
  );
});
