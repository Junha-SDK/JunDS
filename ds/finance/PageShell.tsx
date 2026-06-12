import type { ReactNode } from "react";

interface PageShellProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Limit page max width; default keeps content readable on huge screens */
  maxWidth?: number | "full";
}

export function PageShell({
  title,
  description,
  actions,
  children,
  maxWidth = 1440,
}: PageShellProps) {
  const widthStyle =
    maxWidth === "full" ? undefined : { maxWidth: `${maxWidth}px` };
  return (
    <div className="px-4 lg:px-6 py-5 lg:py-7">
      <div className="mx-auto" style={widthStyle}>
        {title ? (
          // Mobile: stack the title above the actions so the title can use
          // the full row width. Tablet/desktop (sm+): side-by-side, with the
          // title block flexing and actions pinned right.
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
            <div className="min-w-0 flex-1">
              <h1 className="font-extrabold text-[20px] lg:text-[24px] tracking-tight">
                {title}
              </h1>
              {description ? (
                <p className="text-[13px] text-[color:var(--bm-muted)] mt-0.5">
                  {description}
                </p>
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
