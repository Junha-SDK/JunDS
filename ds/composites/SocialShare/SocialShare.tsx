"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export type SocialPlatform =
  | "twitter"
  | "facebook"
  | "linkedin"
  | "kakao"
  | "telegram"
  | "whatsapp"
  | "email"
  | "copy";

export interface SocialShareProps extends HTMLAttributes<HTMLDivElement> {
  /** 공유할 URL */
  url: string;
  /** 공유 제목/본문 */
  title?: string;
  /** 노출할 플랫폼 */
  platforms?: SocialPlatform[];
  /** 크기 */
  size?: "sm" | "md" | "lg";
  /** 동그라미 vs 사각형 */
  shape?: "circle" | "square";
}

/**
 * 플랫폼 브랜드 색은 정체성이라 리터럴로 남긴다 — 토큰으로 옮기면 X 가 X 로 안 보인다.
 * 반대로 email·copy 는 브랜드가 없다. 그 둘만 테마를 따라가는 의미색으로 돌린다.
 */
const COLORS: Record<SocialPlatform, string> = {
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  kakao: "#FEE500",
  telegram: "#26A5E4",
  whatsapp: "#25D366",
  email: "var(--foreground)",
  copy: "var(--muted)",
};

/** 배경 위 글자색. 카카오 노랑 위 흰 글자는 읽히지 않고, 중립 칩은 배경색을 뒤집어야 한다 */
const FG: Partial<Record<SocialPlatform, string>> = {
  kakao: "#3C1E1E",
  email: "var(--background)",
  copy: "var(--background)",
};

const LABELS: Record<SocialPlatform, string> = {
  twitter: "X(Twitter)",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  kakao: "KakaoTalk",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  email: "Email",
  copy: "복사",
};

function buildShareUrl(p: SocialPlatform, url: string, title: string): string | null {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (p) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "telegram":
      return `https://t.me/share/url?url=${u}&text=${t}`;
    case "whatsapp":
      return `https://wa.me/?text=${t}%20${u}`;
    case "email":
      return `mailto:?subject=${t}&body=${u}`;
    case "kakao":
      return null;
    case "copy":
      return null;
  }
}

const sizeMap = { sm: 28, md: 36, lg: 44 };

/**
 * 소셜 공유 버튼 그룹 (X / Facebook / LinkedIn / Kakao / Telegram / WhatsApp / Email / 복사).
 * @example
 * <SocialShare url="https://example.com" title="JunDS!" />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const SocialShare = forwardRef<HTMLDivElement, SocialShareProps>(function SocialShare(
  {
    url,
    title = "",
    platforms = ["twitter", "facebook", "linkedin", "kakao", "email", "copy"],
    size = "md",
    shape = "circle",
    className,
    ...props
  },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const px = sizeMap[size];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label="공유"
      className={cn("inline-flex items-center gap-2 flex-wrap", className)}
      {...props}
    >
      {platforms.map((p) => {
        const href = buildShareUrl(p, url, title);
        const onClick = p === "copy" ? handleCopy : undefined;
        const label = p === "copy" && copied ? "복사됨" : LABELS[p];
        const commonProps = {
          "aria-label": label,
          title: label,
          className: cn(
            "inline-flex items-center justify-center text-white font-semibold cursor-pointer",
            // 확대는 움직임이다 — 감속 요청을 켠 사용자에게는 전이도 확대도 하지 않는다
            "transition-transform duration-150 hover:scale-110 active:scale-95",
            "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,0,0,0.12)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            shape === "circle" ? "rounded-full" : "rounded-lg",
          ),
          style: {
            width: px,
            height: px,
            background: COLORS[p],
            color: FG[p] ?? "#fff",
          },
          children: (
            <span className="text-xs">
              {p === "twitter" && "𝕏"}
              {p === "facebook" && "f"}
              {p === "linkedin" && "in"}
              {p === "kakao" && "K"}
              {p === "telegram" && "✈"}
              {p === "whatsapp" && "✆"}
              {p === "email" && "✉"}
              {p === "copy" && (copied ? "✓" : "⎘")}
            </span>
          ),
        };
        if (href) {
          return (
            <a key={p} href={href} target="_blank" rel="noopener noreferrer" {...commonProps} />
          );
        }
        return <button key={p} type="button" onClick={onClick} {...commonProps} />;
      })}
    </div>
  );
});
