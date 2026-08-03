import type { ReactNode } from "react";

/** 컨테이너 폭 프리셋 — 숫자 지정도 계속 허용(하위호환) */
export type PageShellWidth = number | "narrow" | "content" | "default" | "wide" | "full";

const WIDTH_PRESETS: Record<Exclude<PageShellWidth, number | "full">, number> = {
  narrow: 920,
  content: 1180,
  default: 1440,
  wide: 1600,
};

interface PageShellProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Limit page max width; default keeps content readable on huge screens */
  maxWidth?: PageShellWidth;
}

export function PageShell({
  title,
  description,
  actions,
  children,
  maxWidth = "default",
}: PageShellProps) {
  const resolved =
    typeof maxWidth === "number" ? maxWidth : maxWidth === "full" ? null : WIDTH_PRESETS[maxWidth];
  const widthStyle = resolved === null ? undefined : { maxWidth: `${resolved}px` };
  return (
    <div className="px-4 lg:px-6 py-5 lg:py-7">
      <div className="mx-auto" style={widthStyle}>
        {title ? (
          // Mobile: stack the title above the actions so the title can use
          // the full row width. Tablet/desktop (sm+): side-by-side, with the
          // title block flexing and actions pinned right.
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
            <div className="min-w-0 flex-1">
              <h1 className="font-extrabold text-[20px] lg:text-[24px] tracking-tight">{title}</h1>
              {description ? (
                <p className="text-[13px] text-[color:var(--bm-muted)] mt-0.5">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="sm:shrink-0">{actions}</div> : null}
          </header>
        ) : null}
        {children}
      </div>
    </div>
  );
}
