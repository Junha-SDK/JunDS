"use client";
import { useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface CollectionItem {
  key: string;
  label: string;
  description?: string;
  category?: string;
  /** 미리보기 렌더 */
  preview?: ReactNode;
  /** 아이콘 또는 썸네일 */
  icon?: ReactNode;
  /** 태그 */
  tags?: string[];
  /** 클릭 핸들러 */
  href?: string;
  onClick?: () => void;
}

export interface CollectionViewProps {
  items: CollectionItem[];
  /** 뷰 모드 */
  view?: "grid" | "list";
  /** 검색 가능 */
  searchable?: boolean;
  /** 카테고리 필터 */
  filterable?: boolean;
  /** 그리드 컬럼 수 */
  columns?: 2 | 3 | 4;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  className?: string;
}

/* ─── 아이콘 SVG ─── */

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={cn(
        "transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={cn(
        "transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <rect x="1" y="2" width="16" height="3" rx="1" fill="currentColor" />
      <rect x="1" y="7.5" width="16" height="3" rx="1" fill="currentColor" />
      <rect x="1" y="13" width="16" height="3" rx="1" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-muted-foreground"
    >
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 11l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── 컬렉션뷰 ─── */

export function CollectionView({
  items,
  view: initialView = "grid",
  searchable = false,
  filterable = false,
  columns = 3,
  emptyMessage = "항목이 없습니다.",
  className,
}: CollectionViewProps) {
  const [currentView, setCurrentView] = useState(initialView);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  /* 카테고리 목록 추출 */
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  /* 필터링 */
  const filtered = useMemo(() => {
    let result = items;

    if (activeCategory) {
      result = result.filter((item) => item.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [items, activeCategory, search]);

  const colsClass: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ─── 상단 바 ─── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 검색 */}
        {searchable && (
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="검색..."
              className={cn(
                "w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background",
                "text-sm placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                "transition-all",
              )}
            />
          </div>
        )}

        {/* 뷰 토글 */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setCurrentView("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              currentView === "grid"
                ? "bg-muted"
                : "hover:bg-muted/50",
            )}
            aria-label="그리드 보기"
          >
            <GridIcon active={currentView === "grid"} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentView("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              currentView === "list"
                ? "bg-muted"
                : "hover:bg-muted/50",
            )}
            aria-label="리스트 보기"
          >
            <ListIcon active={currentView === "list"} />
          </button>
        </div>
      </div>

      {/* 카테고리 필터 칩 */}
      {filterable && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
              !activeCategory
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
            )}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ─── 콘텐츠 ─── */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : currentView === "grid" ? (
        /* ─── 그리드 뷰 ─── */
        <div className={cn("grid gap-4", colsClass[columns])}>
          {filtered.map((item) => {
            const Wrapper = item.onClick || item.href ? "button" : "div";
            return (
              <Wrapper
                key={item.key}
                onClick={item.onClick}
                className={cn(
                  "group relative flex flex-col rounded-xl border border-border bg-card text-left",
                  "overflow-hidden transition-all duration-200",
                  (item.onClick || item.href) &&
                    "cursor-pointer hover:shadow-lg hover:border-primary hover:-translate-y-0.5 hover:z-10",
                )}
              >
                {/* 프리뷰 영역 */}
                <div className="aspect-[4/3] bg-muted/40 flex items-center justify-center overflow-hidden">
                  {item.preview ?? (
                    <span className="text-3xl text-muted-foreground/30">
                      {item.icon ?? item.label.charAt(0)}
                    </span>
                  )}
                </div>

                {/* 정보 영역 */}
                <div className="flex flex-col gap-1.5 p-4">
                  <span className="text-sm font-semibold text-foreground">
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </span>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Wrapper>
            );
          })}
        </div>
      ) : (
        /* ─── 리스트 뷰 ─── */
        <div className="flex flex-col gap-2">
          {filtered.map((item) => {
            const Wrapper = item.onClick || item.href ? "button" : "div";
            return (
              <Wrapper
                key={item.key}
                onClick={item.onClick}
                className={cn(
                  "group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left",
                  "transition-all duration-200",
                  (item.onClick || item.href) &&
                    "cursor-pointer hover:shadow-md hover:border-primary",
                )}
              >
                {/* 아이콘 */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center">
                  {item.icon ?? (
                    <span className="text-sm font-bold text-muted-foreground/50">
                      {item.label.charAt(0)}
                    </span>
                  )}
                </div>

                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {item.label}
                  </div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </div>
                  )}
                </div>

                {/* 태그 */}
                {item.tags && item.tags.length > 0 && (
                  <div className="hidden sm:flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
