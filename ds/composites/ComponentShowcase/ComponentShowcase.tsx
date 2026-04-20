"use client";
import { useState, useMemo, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";
import Link from "next/link";
import type { ReactNode } from "react";

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

const catColors: Record<string, string> = {
  Foundation: "bg-violet-100 text-violet-700",
  Primitives: "bg-blue-100 text-blue-700",
  기본: "bg-blue-100 text-blue-700",
  Composites: "bg-emerald-100 text-emerald-700",
  Patterns: "bg-amber-100 text-amber-700",
  Security: "bg-red-100 text-red-700",
};

const defaultCatColor = "bg-gray-100 text-gray-700";

const gridClasses: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
};

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
  const [overlayPos, setOverlayPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return ["전체", ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "전체" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const computeOverlayPosition = useCallback((cardEl: HTMLDivElement) => {
    const rect = cardEl.getBoundingClientRect();
    const overlayWidth = 320;
    const overlayHeight = 280;

    let top = rect.top + rect.height / 2 - overlayHeight / 2;
    let left = rect.left + rect.width / 2 - overlayWidth / 2;

    // Keep within viewport
    if (left + overlayWidth > window.innerWidth - 8) {
      left = window.innerWidth - overlayWidth - 8;
    }
    if (left < 8) left = 8;
    if (top + overlayHeight > window.innerHeight - 8) {
      top = window.innerHeight - overlayHeight - 8;
    }
    if (top < 8) top = 8;

    return { top, left };
  }, []);

  const handleMouseEnter = useCallback(
    (item: ShowcaseItem) => {
      if (!item.hoverDemo) return;
      hoverTimerRef.current = setTimeout(() => {
        const cardEl = cardRefs.current.get(item.key);
        if (cardEl) {
          setOverlayPos(computeOverlayPosition(cardEl));
          setHoveredKey(item.key);
        }
      }, 300);
    },
    [computeOverlayPosition],
  );

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredKey(null);
    setOverlayPos(null);
  }, []);

  const handleCardClick = useCallback(
    (item: ShowcaseItem) => {
      onItemClick?.(item);
    },
    [onItemClick],
  );

  const setCardRef = useCallback(
    (key: string) => (el: HTMLDivElement | null) => {
      if (el) {
        cardRefs.current.set(key, el);
      } else {
        cardRefs.current.delete(key);
      }
    },
    [],
  );

  const hoveredItem = hoveredKey
    ? items.find((i) => i.key === hoveredKey)
    : null;

  const renderCard = (item: ShowcaseItem) => {
    const cardContent = (
      <>
        {/* Preview zone */}
        <div className="flex h-[160px] items-center justify-center overflow-hidden bg-gray-50 pointer-events-none dark:bg-gray-900">
          <div style={{ transform: "scale(0.85)" }}>{item.preview}</div>
        </div>

        {/* Info zone */}
        <div className="flex h-[64px] flex-col justify-center gap-1 px-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {item.label}
            </span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                catColors[item.category] ?? defaultCatColor,
              )}
            >
              {item.category}
            </span>
          </div>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {item.description}
          </p>
        </div>
      </>
    );

    const sharedProps = {
      ref: setCardRef(item.key),
      className: cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800",
      ),
      onMouseEnter: () => handleMouseEnter(item),
      onMouseLeave: handleMouseLeave,
    };

    if (item.href) {
      return (
        <div
          key={item.key}
          {...sharedProps}
          onClick={() => handleCardClick(item)}
        >
          <Link href={item.href} className="block">
            {cardContent}
          </Link>
        </div>
      );
    }

    return (
      <div
        key={item.key}
        {...sharedProps}
        onClick={() => handleCardClick(item)}
      >
        {cardContent}
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* Top bar */}
      {(searchable || filterable) && (
        <div className="sticky top-0 z-20 flex flex-col gap-3 border-b border-gray-200 bg-white/80 px-1 py-3 backdrop-blur-sm sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-900/80">
          {searchable && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="컴포넌트 검색..."
              className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          )}

          {filterable && (
            <div className="flex flex-1 gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    activeCategory === cat
                      ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      <div className={cn("grid gap-4 pt-4", gridClasses[columns])}>
        {filtered.map(renderCard)}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-sm">검색 결과가 없습니다.</p>
        </div>
      )}

      {/* Hover overlay */}
      {hoveredItem?.hoverDemo && overlayPos && (
        <div
          className="pointer-events-none fixed z-50 animate-in fade-in duration-200"
          style={{
            top: overlayPos.top,
            left: overlayPos.left,
            width: 320,
            height: 280,
          }}
        >
          <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl dark:bg-gray-950">
            <div className="flex flex-1 items-center justify-center overflow-hidden p-4 pointer-events-none">
              {hoveredItem.hoverDemo}
            </div>
            <div className="border-t border-gray-700 px-4 py-2.5">
              <p className="text-sm font-semibold text-white">
                {hoveredItem.label}
              </p>
              <p className="truncate text-xs text-gray-400">
                {hoveredItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
