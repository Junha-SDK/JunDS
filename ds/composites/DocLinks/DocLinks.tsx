"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type DocLinkKind = "github" | "appstore" | "npm" | "figma" | "external";

export interface DocLink {
  /** 이동할 URL */
  href: string;
  /** 표시할 이름 */
  label: string;
  /** 종류를 직접 지정 (없으면 URL·라벨에서 추론) */
  kind?: DocLinkKind;
  /** 오른쪽에 붙는 작은 뱃지 (조직명·플랫폼 등) */
  badge?: string;
}

export interface DocLinksProps extends HTMLAttributes<HTMLUListElement> {
  /** 링크 목록 */
  links: DocLink[];
}

/** URL·라벨에서 링크 종류를 추론한다 */
function inferKind(href: string, label: string): DocLinkKind {
  const s = `${href} ${label}`.toLowerCase();
  if (s.includes("github")) return "github";
  if (s.includes("apps.apple") || s.includes("appstore") || s.includes("app store")) return "appstore";
  if (s.includes("npmjs.com") || s.startsWith("npm ")) return "npm";
  if (s.includes("figma.com")) return "figma";
  return "external";
}

const GithubMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);
const AppleMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);
const NpmMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2 6h20v12H12v-2H8v2H2V6zm2 2v8h2V10h2v6h2V8H4zm10 0v8h2v-6h2v6h2V8h-6z" />
  </svg>
);
const FigmaMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9 2h3v6H9a3 3 0 010-6zm3 0h3a3 3 0 010 6h-3V2zM9 8h3v6H9a3 3 0 010-6zm6 0a3 3 0 110 6 3 3 0 010-6zM9 14h3v3a3 3 0 11-3-3z" />
  </svg>
);
const LinkMark = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const ICONS: Record<DocLinkKind, ReactNode> = {
  github: <GithubMark />,
  appstore: <AppleMark />,
  npm: <NpmMark />,
  figma: <FigmaMark />,
  external: <LinkMark />,
};

/**
 * 문서에 딸린 외부 링크 목록 — GitHub·App Store·npm 등을 종류별 아이콘과 함께.
 *
 * 종류는 URL 에서 추론하므로 대개 `href` 와 `label` 만 넘기면 된다. 추론이
 * 빗나가면 `kind` 로 덮어쓴다.
 *
 * 전부 새 탭으로 열되 `rel="noopener noreferrer"` 를 붙인다 — 문서에서 나가는
 * 링크는 외부 사이트이므로, 원본 탭에 대한 접근 권한을 넘기지 않는다.
 *
 * @example
 * <DocLinks links={[
 *   { href: "https://github.com/jjunhaa0211/JunDS", label: "GitHub" },
 *   { href: "https://apps.apple.com/app/id123", label: "App Store" },
 * ]} />
 * @status stable
 * @since 2.3.0
 * @tags content, navigation
 */
export const DocLinks = forwardRef<HTMLUListElement, DocLinksProps>(function DocLinks(
  { links, className, ...props },
  ref,
) {
  if (links.length === 0) return null;

  return (
    <ul ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
      {links.map((link) => {
        const kind = link.kind ?? inferKind(link.href, link.label);
        return (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 text-sm no-underline transition-colors hover:border-primary hover:bg-card-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <span className="shrink-0 text-muted transition-colors group-hover:text-foreground">
                {ICONS[kind]}
              </span>
              <span className="flex-1 truncate text-foreground">{link.label}</span>
              {link.badge && (
                <span className="shrink-0 rounded-full bg-card-hover px-2 py-0.5 text-2xs text-muted ring-1 ring-border">
                  {link.badge}
                </span>
              )}
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
                className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              >
                <path d="M4.5 11.5L11.5 4.5M11.5 4.5H6M11.5 4.5V10" />
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
});
