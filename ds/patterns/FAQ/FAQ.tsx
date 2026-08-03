"use client";
import { forwardRef, useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface FAQItem {
  /** ID (선택) */
  id?: string;
  /** 질문 */
  question: ReactNode;
  /** 답변 */
  answer: ReactNode;
  /** 카테고리 */
  category?: string;
}

export interface FAQProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 섹션 제목 */
  title?: ReactNode;
  /** 부제 */
  subtitle?: ReactNode;
  /** FAQ 목록 */
  items: FAQItem[];
  /** 다중 펼침 허용 */
  multiple?: boolean;
  /** 카테고리 필터 노출 */
  showCategoryFilter?: boolean;
  /** 검색 입력 노출 */
  searchable?: boolean;
}

/** 카테고리 칩 — 켜짐/꺼짐 두 상태가 같은 형태를 공유한다 */
const chip = cn(
  "px-3 py-1 text-xs rounded-full border cursor-pointer whitespace-nowrap",
  "transition-colors duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);
const chipOn =
  "border-primary bg-primary text-white hover:bg-primary-hover shadow-[0_1px_2px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.18)]";
const chipOff = "border-border hover:bg-muted/10 active:bg-muted/20";

/**
 * FAQ 섹션 (검색 + 카테고리 필터 + 단일/다중 펼침).
 * @example
 * <FAQ title="자주 묻는 질문" items={[{question:"환불은?", answer:"7일 내 가능"}]} searchable />
 * @status stable
 * @since 2.3.0
 * @tags marketing
 */
export const FAQ = forwardRef<HTMLElement, FAQProps>(function FAQ(
  {
    title,
    subtitle,
    items,
    multiple = false,
    showCategoryFilter = false,
    searchable = false,
    className,
    ...props
  },
  ref,
) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => it.category && set.add(it.category));
    return [...set];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (category && it.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const text = `${typeof it.question === "string" ? it.question : ""} ${
          typeof it.answer === "string" ? it.answer : ""
        }`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [items, category, query]);

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      ref={ref}
      className={cn("px-4 sm:px-6 py-12 sm:py-20 max-w-3xl mx-auto", className)}
      {...props}
    >
      {(title || subtitle) && (
        <div className="text-center mb-10">
          {title && <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>}
          {subtitle && <p className="mt-3 text-base text-muted">{subtitle}</p>}
        </div>
      )}

      {(searchable || (showCategoryFilter && categories.length > 0)) && (
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          {searchable && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색..."
              // ring-ring 은 --color-ring 이 없어 아무 링도 그리지 않았다 — 실재하는 토큰으로
              className="flex-1 min-w-0 rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 ease-out hover:border-muted-light focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          )}
          {showCategoryFilter && categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setCategory(null)}
                aria-pressed={category === null}
                className={cn(chip, category === null ? chipOn : chipOff)}
              >
                전체
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={cn(chip, category === c ? chipOn : chipOff)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted">결과가 없습니다.</div>
        )}
        {filtered.map((it, i) => {
          const id = it.id ?? String(i);
          const isOpen = open.has(id);
          return (
            <div
              key={id}
              className={cn(
                "rounded-xl border bg-surface overflow-hidden transition-colors duration-150",
                isOpen ? "border-primary/40" : "border-border",
              )}
            >
              <button
                type="button"
                onClick={() => toggle(id)}
                aria-expanded={isOpen}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-4 py-3 text-left font-medium cursor-pointer",
                  "transition-colors duration-150 hover:bg-muted/10 active:bg-muted/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/55",
                )}
              >
                <span className="min-w-0">{it.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    // 화살표가 도는 건 움직임이다
                    "text-muted shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                    isOpen && "rotate-180",
                  )}
                >
                  ⌄
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-3 text-sm text-muted leading-relaxed">{it.answer}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});
