"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface LogoItem {
  /** alt 텍스트 / 라벨 */
  name: string;
  /** 이미지 src */
  src?: string;
  /** 또는 ReactNode (SVG, 컴포넌트) */
  logo?: ReactNode;
  /** 링크 */
  href?: string;
}

export type LogoCloudLayout = "grid" | "marquee";

export interface LogoCloudProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 섹션 라벨 */
  title?: ReactNode;
  /** 로고 목록 */
  logos: LogoItem[];
  /** 컬럼 수 */
  columns?: 3 | 4 | 5 | 6;
  /** 그레이스케일 */
  grayscale?: boolean;
  /** 레이아웃 */
  layout?: LogoCloudLayout;
}

const colMap: Record<3 | 4 | 5 | 6, string> = {
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-6",
};

/**
 * "사용 중인 회사들" 로고 클라우드 (랜딩 신뢰도 섹션).
 * @example
 * <LogoCloud title="신뢰받는 파트너" logos={[{name:"Acme",src:"/a.svg"}]} columns={5} grayscale />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const LogoCloud = forwardRef<HTMLElement, LogoCloudProps>(function LogoCloud(
  { title, logos, columns = 5, grayscale = true, layout = "grid", className, ...props },
  ref,
) {
  const renderLogo = (l: LogoItem, i: number) => {
    const inner = l.logo ?? (l.src ? <img src={l.src} alt={l.name} className="h-8 w-auto object-contain" /> : <span className="text-sm font-semibold text-muted">{l.name}</span>);
    const wrap = (children: ReactNode) => (
      <div
        key={i}
        title={l.name}
        className={cn(
          "flex items-center justify-center h-12 px-4",
          grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition",
        )}
      >
        {children}
      </div>
    );
    if (l.href) {
      return (
        <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.name}>
          {wrap(inner)}
        </a>
      );
    }
    return wrap(inner);
  };

  return (
    <section ref={ref} className={cn("px-4 sm:px-6 py-10", className)} {...props}>
      {title && <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted mb-6">{title}</div>}
      {layout === "grid" ? (
        <div className={cn("max-w-5xl mx-auto grid gap-6 items-center", colMap[columns])}>
          {logos.map(renderLogo)}
        </div>
      ) : (
        <div className="overflow-hidden relative max-w-7xl mx-auto" aria-label="logos">
          <div className="flex gap-10 animate-[junds-marquee_30s_linear_infinite] whitespace-nowrap">
            {[...logos, ...logos].map(renderLogo)}
          </div>
          <style>{`@keyframes junds-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </div>
      )}
    </section>
  );
});
