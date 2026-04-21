"use client";
import { useState, useMemo, useCallback } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export interface ShowcaseItem {
  key: string;
  label: string;
  description: string;
  category: string;
  href?: string;
  preview: ReactNode;
  hoverDemo?: ReactNode;
}

export interface ComponentShowcaseProps {
  items: ShowcaseItem[];
  searchable?: boolean;
  filterable?: boolean;
  columns?: 2 | 3 | 4;
  onItemClick?: (item: ShowcaseItem) => void;
  className?: string;
}

/* ================================================================== */
/*  Styles                                                             */
/* ================================================================== */

const catBadge: Record<string, string> = {
  Foundation: "bg-violet-500/10 text-violet-600 border-violet-200",
  Primitives: "bg-blue-500/10 text-blue-600 border-blue-200",
  Composites: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Patterns: "bg-amber-500/10 text-amber-600 border-amber-200",
  Security: "bg-red-500/10 text-red-600 border-red-200",
  Advanced: "bg-rose-500/10 text-rose-600 border-rose-200",
};

/** 카드 미리보기 영역의 카테고리별 배경 그라데이션 */
const catPreviewBg: Record<string, string> = {
  Foundation: "bg-gradient-to-br from-violet-50 to-purple-50",
  Primitives: "bg-gradient-to-br from-blue-50 to-indigo-50",
  Composites: "bg-gradient-to-br from-emerald-50 to-teal-50",
  Patterns: "bg-gradient-to-br from-amber-50 to-orange-50",
  Security: "bg-gradient-to-br from-red-50 to-pink-50",
  Advanced: "bg-gradient-to-br from-rose-50 to-fuchsia-50",
};

/** 호버 시 카드 글로우 색상 */
const catGlow: Record<string, string> = {
  Foundation: "shadow-violet-500/20",
  Primitives: "shadow-blue-500/20",
  Composites: "shadow-emerald-500/20",
  Patterns: "shadow-amber-500/20",
  Security: "shadow-red-500/20",
  Advanced: "shadow-rose-500/20",
};

const catChipActive: Record<string, string> = {
  "전체": "bg-foreground text-background",
  Foundation: "bg-violet-500 text-white",
  Primitives: "bg-blue-500 text-white",
  Composites: "bg-emerald-500 text-white",
  Patterns: "bg-amber-500 text-white",
  Security: "bg-red-500 text-white",
  Advanced: "bg-rose-500 text-white",
};

const gridCls: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

/* ================================================================== */
/*  ComponentShowcase                                                  */
/* ================================================================== */

export function ComponentShowcase({
  items,
  searchable = true,
  filterable = true,
  columns = 3,
  onItemClick,
  className,
}: ComponentShowcaseProps) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("전체");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return ["전체", ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) => {
      if (q && !item.label.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
      if (activeCat !== "전체" && item.category !== activeCat) return false;
      return true;
    });
  }, [items, search, activeCat]);

  const handleClick = useCallback((item: ShowcaseItem) => { onItemClick?.(item); }, [onItemClick]);

  return (
    <div className={cn("relative", className)}>
      {/* ── Controls ── */}
      {(searchable || filterable) && (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="컴포넌트 검색..."
                className="h-11 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-72 transition-all"
              />
            </div>
          )}
          {filterable && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat} type="button"
                  onClick={() => setActiveCat(cat)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
                    activeCat === cat
                      ? catChipActive[cat] || "bg-foreground text-background"
                      : "bg-card text-muted border border-border hover:border-foreground/20 hover:text-foreground",
                  )}
                >
                  {cat}
                  {cat !== "전체" && (
                    <span className="ml-1 opacity-60">
                      {items.filter(i => i.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 opacity-20">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium">검색 결과가 없습니다</p>
          <p className="text-xs mt-1">다른 키워드로 검색해 보세요</p>
        </div>
      ) : (
        <div className={cn("grid gap-6", gridCls[columns])}>
          {filtered.map((item, i) => (
            <ShowcaseCard
              key={item.key}
              item={item}
              index={i}
              isHovered={hoveredKey === item.key}
              onHover={setHoveredKey}
              onClick={handleClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Card                                                               */
/* ================================================================== */

function ShowcaseCard({
  item, index, isHovered, onHover, onClick,
}: {
  item: ShowcaseItem; index: number;
  isHovered: boolean;
  onHover: (key: string | null) => void;
  onClick: (item: ShowcaseItem) => void;
}) {
  const showDemo = isHovered && item.hoverDemo;
  const bg = catPreviewBg[item.category] || "bg-gradient-to-br from-gray-50 to-gray-100";
  const glow = catGlow[item.category] || "shadow-gray-500/20";
  const badge = catBadge[item.category] || "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-2xl border bg-card overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10",
        isHovered
          ? `border-primary/40 shadow-2xl ${glow} -translate-y-1 z-10`
          : "border-border shadow-sm hover:shadow-md hover:-translate-y-0.5",
      )}
      style={{ animationDelay: `${index * 30}ms` }}
      onMouseEnter={() => onHover(item.key)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(item)}
    >
      {/* ── Preview zone ── */}
      <div className={cn("relative h-[200px] overflow-hidden", bg)}>
        {/* 패턴 오버레이 — 미묘한 도트 */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
          backgroundSize: "12px 12px",
        }} />

        {/* 정적 미리보기 */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center p-5 pointer-events-none transition-all duration-500 ease-out",
          showDemo ? "opacity-0 scale-90 blur-sm" : "opacity-100 scale-100 blur-0",
        )}>
          <div className="transform scale-[0.8] flex items-center justify-center w-full">{item.preview}</div>
        </div>

        {/* 호버 데모 */}
        {item.hoverDemo && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center p-5 pointer-events-none transition-all duration-500 ease-out",
            showDemo ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-110 blur-sm",
          )}>
            <div className="w-full max-h-full overflow-hidden transform scale-90 flex items-center justify-center">{item.hoverDemo}</div>
          </div>
        )}

        {/* 호버 그라데이션 오버레이 */}
        <div className={cn(
          "absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/80 to-transparent transition-opacity duration-300 pointer-events-none",
          isHovered ? "opacity-0" : "opacity-100",
        )} />

        {/* "미리보기" 배지 */}
        {item.hoverDemo && (
          <div className={cn(
            "absolute top-3 right-3 flex items-center gap-1 rounded-full bg-foreground/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-background transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
          )}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            인터랙션 미리보기
          </div>
        )}
      </div>

      {/* ── Info zone ── */}
      <div className="px-4 py-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-foreground tracking-tight">{item.label}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold border", badge)}>
            {item.category}
          </span>
        </div>
        <p className="text-xs text-muted leading-relaxed line-clamp-2">{item.description}</p>
      </div>

      {/* 하단 악센트 라인 */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300",
        isHovered ? "opacity-100" : "opacity-0",
      )} style={{
        background: `linear-gradient(90deg, transparent, var(--primary), transparent)`,
      }} />
    </div>
  );
}
