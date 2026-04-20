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
  /** 카드에 표시할 정적 미리보기 (실제 컴포넌트 렌더) */
  preview: ReactNode;
  /** 호버 시 보여줄 인터랙션 데모 */
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
/*  Constants                                                          */
/* ================================================================== */

const catColors: Record<string, string> = {
  Foundation: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  Primitives: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Composites: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Patterns: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Security: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Advanced: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const catChipColors: Record<string, string> = {
  "전체": "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
  Foundation: "bg-violet-500 text-white",
  Primitives: "bg-blue-500 text-white",
  Composites: "bg-emerald-500 text-white",
  Patterns: "bg-amber-500 text-white",
  Security: "bg-red-500 text-white",
  Advanced: "bg-rose-500 text-white",
};

const defaultCatColor = "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";

const gridClasses: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

/* ================================================================== */
/*  Component                                                          */
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
  const [activeCategory, setActiveCategory] = useState("전체");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return ["전체", ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "전체" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const handleClick = useCallback(
    (item: ShowcaseItem) => {
      onItemClick?.(item);
    },
    [onItemClick],
  );

  return (
    <div className={cn("relative", className)}>
      {/* ── Top bar ── */}
      {(searchable || filterable) && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {searchable && (
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="컴포넌트 검색..."
                className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-64"
              />
            </div>
          )}
          {filterable && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                      isActive
                        ? catChipColors[cat] || "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <div className="text-3xl mb-2 opacity-30">∅</div>
          <p className="text-sm">검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className={cn("grid gap-5", gridClasses[columns])}>
          {filtered.map((item) => (
            <ShowcaseCard
              key={item.key}
              item={item}
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
  item,
  isHovered,
  onHover,
  onClick,
}: {
  item: ShowcaseItem;
  isHovered: boolean;
  onHover: (key: string | null) => void;
  onClick: (item: ShowcaseItem) => void;
}) {
  const showDemo = isHovered && item.hoverDemo;

  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-2xl border bg-card transition-all duration-300 ease-out overflow-hidden",
        isHovered
          ? "border-primary shadow-xl shadow-primary/10 scale-[1.02] z-10"
          : "border-border shadow-sm hover:shadow-md",
      )}
      onMouseEnter={() => onHover(item.key)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(item)}
    >
      {/* ── Preview / Demo zone ── */}
      <div className="relative h-[180px] overflow-hidden bg-gray-50 dark:bg-gray-900/50">
        {/* 정적 미리보기 — 항상 표시, 호버 시 페이드 아웃 */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center p-4 pointer-events-none transition-opacity duration-300",
            showDemo ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="transform scale-90">{item.preview}</div>
        </div>

        {/* 호버 데모 — 호버 시 페이드 인 */}
        {item.hoverDemo && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center p-4 pointer-events-none transition-all duration-300",
              showDemo
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95",
            )}
          >
            <div className="w-full max-h-full overflow-hidden">{item.hoverDemo}</div>
          </div>
        )}

        {/* 호버 힌트 배지 */}
        {item.hoverDemo && (
          <div
            className={cn(
              "absolute top-2 right-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-medium text-white transition-all duration-200",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
            )}
          >
            미리보기
          </div>
        )}
      </div>

      {/* ── Info zone ── */}
      <div className="px-4 py-3 border-t border-border/50">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-semibold text-foreground">{item.label}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              catColors[item.category] ?? defaultCatColor,
            )}
          >
            {item.category}
          </span>
        </div>
        <p className="text-xs text-muted truncate">{item.description}</p>
      </div>
    </div>
  );
}
