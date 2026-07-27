"use client";

import { forwardRef, useState, type CSSProperties, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface AlbumArtProps extends HTMLAttributes<HTMLSpanElement> {
  /** 커버 이미지 URL. 없거나 로드에 실패하면 생성 커버로 폴백한다 */
  src?: string;
  /** 생성 커버의 시드 (제목 + 아티스트 등). 같은 시드는 언제나 같은 커버가 된다 */
  seed: string;
  /**
   * 접근성 이름. 비워 두면(기본) 장식으로 보고 스크린리더에서 숨긴다 —
   * 커버 옆에 곡 제목이 텍스트로 있는 보통의 배치에서는 이쪽이 맞다.
   */
  alt?: string;
  /** 생성 커버 가운데에 놓을 글리프 (기본 `"♪"`) */
  glyph?: string;
  /** 한 변의 크기 (px 또는 CSS 길이, 기본 `"100%"`) */
  size?: number | string;
  /** 모서리 둥글기 (기본 `"md"`) */
  radius?: "none" | "sm" | "md" | "lg" | "full";
}

const radiusClass = {
  none: "rounded-none",
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-2xl",
  full: "rounded-full",
} as const;

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * 앨범/트랙 커버. 이미지가 없거나 깨지면 시드에서 만든 커버로 대신한다.
 *
 * 생성 커버는 채도·명도를 낮춘 두 색의 그라디언트다 — 무지개빛 그라디언트를
 * 피한 건, 진짜 커버들 사이에 섞였을 때 폴백만 튀어 보이지 않게 하기 위해서다.
 * 색은 시드 해시에서 결정적으로 정해지므로 곡마다 고유하면서도 매 렌더 같다.
 *
 * @example
 * <AlbumArt src={track.cover} seed={`${track.title}-${track.artist}`} size={56} />
 * @status stable
 * @since 2.3.0
 * @tags media, audio
 */
export const AlbumArt = forwardRef<HTMLSpanElement, AlbumArtProps>(function AlbumArt(
  { src, seed, alt = "", glyph = "♪", size = "100%", radius = "md", className, style, ...props },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;

  // 접근성 이름은 바깥 span 하나가 진다. 이미지가 뜨든 생성 커버가 뜨든 구조가
  // 달라지므로, 안쪽이 아니라 감싸는 쪽에 이름을 두어야 일관된다.
  // 이름이 없으면(기본값) 장식으로 보고 통째로 숨긴다 — 트랙 제목은 보통 옆에
  // 텍스트로 이미 있어서, 커버까지 읽어 주면 중복이다.
  const label = (props["aria-label"] as string | undefined) ?? (alt || undefined);

  const h = hashStr(seed);
  const hue = h % 360;
  const hue2 = (hue + 16) % 360;
  const angle = 135 + (h % 30); // 완만하게만 기울인다

  return (
    <span
      ref={ref}
      className={cn(
        "relative inline-block shrink-0 overflow-hidden bg-card",
        radiusClass[radius],
        className,
      )}
      style={{ width: size, aspectRatio: "1 / 1", ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {showImg ? (
        <img
          className="h-full w-full object-cover"
          src={src}
          // 이름은 바깥 span 이 가지므로 여기는 항상 장식으로 둔다
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center"
          style={
            {
              background: `linear-gradient(${angle}deg, hsl(${hue} 22% 27%), hsl(${hue2} 18% 16%))`,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          <span
            className="text-white/45 leading-none"
            style={{ fontSize: "min(38%, 2.5rem)" }}
          >
            {glyph}
          </span>
        </span>
      )}
    </span>
  );
});
