"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type ProjectCardVariant = "row" | "feature";

export interface ProjectCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 프로젝트명 */
  title: string;
  /** 한 줄 설명 */
  subtitle?: string;
  /** 아이콘/썸네일 URL */
  icon?: string;
  /** 이미지 대신 넣을 아이콘 노드 (`icon` 보다 우선) */
  iconNode?: ReactNode;
  /** 오른쪽 끝에 놓을 연도·기간 라벨 */
  meta?: string;
  /** 제목 옆/오른쪽에 붙일 뱃지들 ("App Store", "OSS" 등) */
  badges?: ReactNode;
  /** 이동할 URL. 주면 카드 전체가 링크가 된다 */
  href?: string;
  /** 외부 링크로 열지 (`target="_blank"` + rel) */
  external?: boolean;
  /**
   * 호버·포커스·터치 시작 시 호출 — 상세 페이지 청크를 미리 받아 둘 때 쓴다.
   * 사용자가 누르기 전에 미리 받아 두면 클릭 후 대기가 사라진다.
   */
  onPrefetch?: () => void;
  /** 오른쪽 끝 화살표 표시 (기본: `href` 가 있으면 true) */
  arrow?: boolean;
  /**
   * `row` 는 목록용 촘촘한 한 줄, `feature` 는 대표작을 조금 크게 보여주는 형태.
   */
  variant?: ProjectCardVariant;
  /**
   * 링크 렌더러. Next.js `<Link>` 나 react-router `<Link>` 를 쓰려면 넘긴다.
   * 기본은 평범한 `<a>`.
   */
  renderLink?: (props: {
    href: string;
    className: string;
    children: ReactNode;
  }) => ReactNode;
}

const baseClass =
  "group flex items-center gap-3 rounded-xl border border-border bg-card no-underline transition-colors";
const interactiveClass =
  "hover:border-primary hover:bg-card-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

const variantClass: Record<ProjectCardVariant, string> = {
  row: "px-3 py-2.5",
  feature: "px-4 py-4 gap-4",
};

const iconSize: Record<ProjectCardVariant, string> = {
  row: "h-9 w-9",
  feature: "h-12 w-12",
};

/**
 * 프로젝트 한 줄 카드 — 아이콘·제목·설명·뱃지·연도·화살표.
 *
 * 포트폴리오 목록처럼 "행 자체가 링크"인 인덱스를 만들 때 쓴다. 상세 내용은
 * 링크 너머에 두고 여기서는 훑어보기에 필요한 것만 남긴다.
 *
 * `onPrefetch` 를 주면 호버·포커스·터치 시작 시점에 미리 호출되므로, 라우터의
 * 프리페치나 청크 프리로드를 걸어 클릭 후 체감 대기를 없앨 수 있다.
 *
 * @example
 * <ProjectCard
 *   title="JunDS" subtitle="디자인 시스템" icon="/icons/junds.svg"
 *   meta="2024—" href="/docs/junds" badges={<Badge>OSS</Badge>}
 * />
 * @status stable
 * @since 2.3.0
 * @tags content, navigation
 */
export const ProjectCard = forwardRef<HTMLElement, ProjectCardProps>(function ProjectCard(
  {
    title,
    subtitle,
    icon,
    iconNode,
    meta,
    badges,
    href,
    external,
    onPrefetch,
    arrow,
    variant = "row",
    renderLink,
    className,
    ...props
  },
  ref,
) {
  const showArrow = arrow ?? Boolean(href);
  const isExternal = external ?? (href ? /^https?:\/\//.test(href) : false);

  const body = (
    <>
      {iconNode ??
        (icon && (
          <img
            src={icon}
            alt=""
            loading="lazy"
            decoding="async"
            className={cn("shrink-0 rounded-lg object-cover", iconSize[variant])}
          />
        ))}

      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "truncate font-medium text-foreground transition-colors group-hover:text-primary",
            variant === "feature" ? "text-base" : "text-sm",
          )}
        >
          {title}
        </h3>
        {subtitle && (
          <p className={cn("truncate text-muted", variant === "feature" ? "text-sm" : "text-xs")}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {badges}
        {meta && <span className="text-xs tabular-nums text-muted">{meta}</span>}
        {showArrow && (
          <span
            aria-hidden="true"
            className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          >
            →
          </span>
        )}
      </div>
    </>
  );

  const classes = cn(baseClass, variantClass[variant], href && interactiveClass, className);

  if (href) {
    if (renderLink) {
      return <>{renderLink({ href, className: classes, children: body })}</>;
    }
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onMouseEnter={onPrefetch}
        onFocus={onPrefetch}
        onTouchStart={onPrefetch}
        {...(props as HTMLAttributes<HTMLAnchorElement>)}
      >
        {body}
      </a>
    );
  }

  return (
    <article ref={ref as React.Ref<HTMLElement>} className={classes} {...props}>
      {body}
    </article>
  );
});
