"use client";

import { forwardRef, useState, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface ScreenshotGridProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** 이미지 경로 목록. 절대 URL 이 아니면 `basePath` 가 앞에 붙는다 */
  images: string[];
  /** 상대 경로 앞에 붙일 접두사 (예: `"/docs/img/"`) */
  basePath?: string;
  /** 이미지 alt 를 만드는 함수 (기본: 빈 문자열 = 장식으로 취급) */
  alt?: (src: string, index: number) => string;
  /** 컬럼 수 (기본 3) */
  columns?: 2 | 3 | 4;
  /** 이미지 클릭 핸들러 — 라이트박스를 열 때 쓴다 */
  onSelect?: (src: string, index: number) => void;
}

const colsMap = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
} as const;

const isAbsolute = (src: string) => /^(https?:)?\/\//.test(src) || src.startsWith("/");

/**
 * 문서용 스크린샷 그리드. 로드에 실패한 이미지는 조용히 목록에서 뺀다.
 *
 * 문서에 적어 둔 스크린샷 경로는 시간이 지나면 파일이 사라지거나 호스트가
 * 죽기 마련이다. 그때 깨진 이미지 아이콘이 격자에 남는 것보다는 그 칸이 아예
 * 없는 편이 낫다 — 전부 실패하면 컴포넌트 자체가 사라진다.
 *
 * 사용자가 올린 사진 갤러리라면 `PhotoGrid` + `PhotoCard` 쪽이 맞다. 이쪽은
 * "문서에 곁들이는 이미지"용의 얇은 격자다.
 *
 * @example
 * <ScreenshotGrid images={["home.png", "detail.png"]} basePath="/docs/img/" />
 * @status stable
 * @since 2.3.0
 * @tags content, media
 */
export const ScreenshotGrid = forwardRef<HTMLDivElement, ScreenshotGridProps>(
  function ScreenshotGrid(
    { images, basePath = "", alt, columns = 3, onSelect, className, ...props },
    ref,
  ) {
    const [broken, setBroken] = useState<Set<string>>(() => new Set());
    const visible = images.filter((src) => !broken.has(src));

    if (visible.length === 0) return null;

    return (
      <div ref={ref} className={cn("grid gap-3", colsMap[columns], className)} {...props}>
        {visible.map((src, i) => {
          const url = isAbsolute(src) ? src : `${basePath}${src}`;
          const img = (
            <img
              src={url}
              alt={alt?.(src, i) ?? ""}
              loading="lazy"
              decoding="async"
              // `block` 이 없으면 인라인 이미지의 baseline 여백이 버튼 안에 4px 틈으로 남는다.
              className="block w-full rounded-lg border border-border bg-surface-soft object-cover"
              onError={() =>
                setBroken((prev) => {
                  if (prev.has(src)) return prev;
                  const next = new Set(prev);
                  next.add(src);
                  return next;
                })
              }
            />
          );

          if (!onSelect) return <div key={src}>{img}</div>;
          return (
            <button
              key={src}
              type="button"
              onClick={() => onSelect(src, i)}
              className="block cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              {img}
            </button>
          );
        })}
      </div>
    );
  },
);
