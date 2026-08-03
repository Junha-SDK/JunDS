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
  /** 컬렉션 항목 목록 */
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
  /** 추가 클래스 */
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
      className={cn("transition-colors", active ? "text-primary-ink" : "text-muted")}
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
      className={cn("transition-colors", active ? "text-primary-ink" : "text-muted")}
    >
      <rect x="1" y="2" width="16" height="3" rx="1" fill="currentColor" />
      <rect x="1" y="7.5" width="16" height="3" rx="1" fill="currentColor" />
      <rect x="1" y="13" width="16" height="3" rx="1" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── 컬렉션뷰 ─── */

/**
 * 검색·필터·뷰 전환을 지원하는 컬렉션 뷰어.
 * @example
 * <CollectionView items={items} view="grid" searchable filterable />
 * @status stable
 * @since 2.2.0
 * @tags data
 */
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
                "w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card",
                "text-sm placeholder:text-muted-light",
                // 색과 글로우만 바뀐다 — transition-all 은 padding 까지 물어 리플로우를 만든다
                "transition-[border-color,box-shadow] duration-200 ease-out",
                "hover:border-muted-light",
                "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
              )}
            />
          </div>
        )}

        {/* 뷰 토글 */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setCurrentView("grid")}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
              // bg-muted 는 본문 회색(#6b6880)이라 배경으로 깔면 어두운 판이 된다 — 선택 표시는 primary 틴트로
              currentView === "grid" ? "bg-primary/10" : "hover:bg-card-hover",
            )}
            aria-label="그리드 보기"
            aria-pressed={currentView === "grid"}
          >
            <GridIcon active={currentView === "grid"} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentView("list")}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
              currentView === "list" ? "bg-primary/10" : "hover:bg-card-hover",
            )}
            aria-label="리스트 보기"
            aria-pressed={currentView === "list"}
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
            aria-pressed={!activeCategory}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border cursor-pointer whitespace-nowrap",
              "transition-colors active:scale-[0.97] motion-reduce:active:scale-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              // text-primary-foreground 는 이 라이브러리에 없는 토큰이라 대비가 사라진다
              !activeCategory
                ? "bg-primary text-white border-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                : "bg-card text-muted border-border hover:bg-card-hover hover:text-foreground",
            )}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              aria-pressed={activeCategory === cat}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border cursor-pointer whitespace-nowrap",
                "transition-colors active:scale-[0.97] motion-reduce:active:scale-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activeCategory === cat
                  ? "bg-primary text-white border-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                  : "bg-card text-muted border-border hover:bg-card-hover hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ─── 콘텐츠 ─── */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted">
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
                  "group relative flex flex-col rounded-xl border border-border bg-card text-left min-w-0",
                  // 뜨는 카드는 그림자 한 겹으로는 배경에서 떨어지지 않는다 — 다층 그림자로 세운다.
                  // 움직이는 것은 transform·shadow·border 뿐이라 감속 요청도 여기서 받는다
                  "overflow-hidden transition-[transform,box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none",
                  (item.onClick || item.href) &&
                    "cursor-pointer hover:border-primary hover:-translate-y-0.5 hover:z-10 motion-reduce:hover:translate-y-0 hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.28),0_4px_10px_-4px_rgba(0,0,0,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                {/* 프리뷰 영역 */}
                <div className="aspect-[4/3] bg-card-hover border-b border-border-light flex items-center justify-center overflow-hidden">
                  {item.preview ?? (
                    <span className="text-3xl text-muted-light/50">
                      {item.icon ?? item.label.charAt(0)}
                    </span>
                  )}
                </div>

                {/* 정보 영역 */}
                <div className="flex flex-col gap-1.5 p-4 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-xs text-muted line-clamp-2">{item.description}</span>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex px-1.5 py-0.5 rounded-lg text-[10px] font-medium bg-background text-muted ring-1 ring-border-light whitespace-nowrap"
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
                  "group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left w-full min-w-0",
                  "transition-[box-shadow,border-color,background-color] duration-200 ease-out",
                  (item.onClick || item.href) &&
                    "cursor-pointer hover:border-primary hover:bg-card-hover hover:shadow-[0_6px_18px_-8px_rgba(0,0,0,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                {/* 아이콘 */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-background ring-1 ring-border-light flex items-center justify-center">
                  {item.icon ?? (
                    <span className="text-sm font-bold text-muted-light">
                      {item.label.charAt(0)}
                    </span>
                  )}
                </div>

                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted truncate">{item.description}</div>
                  )}
                </div>

                {/* 태그 */}
                {item.tags && item.tags.length > 0 && (
                  <div className="hidden sm:flex flex-wrap gap-1 shrink-0">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex px-1.5 py-0.5 rounded-lg text-[10px] font-medium bg-background text-muted ring-1 ring-border-light whitespace-nowrap"
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
