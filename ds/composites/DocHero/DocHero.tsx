"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface DocHeroStat {
  /** 지표 이름 */
  label: string;
  /** 지표 값 */
  value: string;
}

export interface DocHeroProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "role"> {
  /** 문서 제목 */
  title: string;
  /** 한 줄 설명 */
  subtitle?: string;
  /** 제목 위에 놓을 작은 라벨 (역할·분류 등) */
  eyebrow?: string;
  /** 아이콘/썸네일 URL */
  icon?: string;
  /** 이미지 대신 넣을 아이콘 노드 (`icon` 보다 우선) */
  iconNode?: ReactNode;
  /** 표시할 날짜 문자열 */
  date?: string;
  /** `<time datetime>` 에 넣을 기계 판독용 날짜 (없으면 `date` 를 쓴다) */
  dateTime?: string;
  /** 사용 기술 등 칩으로 늘어놓을 라벨들 */
  tags?: string[];
  /** 배경에 깔 배너 이미지 URL */
  banner?: string;
  /** 하단에 붙는 지표 스트립 */
  stats?: DocHeroStat[];
}

/**
 * 문서/프로젝트 상세 상단의 히어로 — 배너·아이콘·제목·설명·기술 칩·지표 스트립.
 *
 * 랜딩 페이지용 `HeroSection` 과 달리 "이 문서가 무엇인지"를 빠르게 훑게 하는 게
 * 목적이라, 행동 유도(CTA) 대신 메타데이터를 촘촘히 싣는다.
 *
 * 배너는 위에 글자가 얹히므로 어두운 그라디언트를 덧씌운다 — 밝은 사진이 와도
 * 제목 대비가 무너지지 않게 하기 위해서다.
 *
 * @example
 * <DocHero title="JunDS" subtitle="디자인 시스템" eyebrow="라이브러리"
 *   tags={["React", "TypeScript"]} stats={[{ label: "컴포넌트", value: "313" }]} />
 * @status stable
 * @since 2.3.0
 * @tags content, layout
 */
export const DocHero = forwardRef<HTMLElement, DocHeroProps>(function DocHero(
  {
    title,
    subtitle,
    eyebrow,
    icon,
    iconNode,
    date,
    dateTime,
    tags,
    banner,
    stats,
    className,
    ...props
  },
  ref,
) {
  const onBanner = Boolean(banner);

  return (
    <header
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border",
        onBanner ? "bg-gray-900" : "bg-card",
        className,
      )}
      {...props}
    >
      {banner && (
        <>
          <img
            src={banner}
            alt=""
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* 밝은 배너 위에서도 글자가 읽히도록 어둡게 깐다 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/25"
          />
        </>
      )}

      <div
        className={cn(
          "relative flex flex-col gap-2 px-6",
          onBanner ? "pb-6 pt-24 text-white" : "py-6",
        )}
      >
        {iconNode ??
          (icon && (
            <img
              src={icon}
              alt=""
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="h-12 w-12 rounded-xl object-cover"
            />
          ))}

        {eyebrow && (
          <span
            className={cn(
              "text-2xs uppercase tracking-wider",
              onBanner ? "text-white/70" : "text-muted",
            )}
          >
            {eyebrow}
          </span>
        )}

        <h1 className={cn("text-2xl font-bold", onBanner ? "text-white" : "text-foreground")}>
          {title}
        </h1>

        {subtitle && (
          <p className={cn("text-sm", onBanner ? "text-white/80" : "text-muted")}>
            {subtitle}
          </p>
        )}

        {date && (
          <time
            dateTime={dateTime ?? date}
            className={cn("text-xs", onBanner ? "text-white/60" : "text-muted")}
          >
            {date}
          </time>
        )}

        {tags && tags.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li
                key={t}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-2xs",
                  onBanner
                    ? "bg-white/15 text-white/90"
                    : "bg-card-hover text-muted ring-1 ring-border",
                )}
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>

      {stats && stats.length > 0 && (
        <dl
          className={cn(
            "relative grid grid-cols-2 gap-px border-t sm:grid-cols-4",
            onBanner ? "border-white/15 bg-white/10" : "border-border bg-border",
          )}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col gap-0.5 px-4 py-3",
                onBanner ? "bg-black/40" : "bg-card",
              )}
            >
              <dt className={cn("text-2xs", onBanner ? "text-white/60" : "text-muted")}>
                {s.label}
              </dt>
              <dd
                className={cn(
                  "text-base font-semibold tabular-nums",
                  onBanner ? "text-white" : "text-foreground",
                )}
              >
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
});
