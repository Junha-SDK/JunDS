"use client";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes } from "react";

export interface TocItem {
  /** 헤딩 ID */
  id: string;
  /** 헤딩 텍스트 */
  label: string;
  /** 레벨 (h1=1, h2=2, ...) */
  level: number;
}

export interface TableOfContentsProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 명시적 항목 (없으면 selector로 자동 수집) */
  items?: TocItem[];
  /** 자동 수집할 헤딩 셀렉터 */
  selector?: string;
  /** 컨테이너 셀렉터 (없으면 document) */
  rootSelector?: string;
  /**
   * 수집에서 제외할 헤딩 셀렉터.
   * 화면에는 안 보이지만 접근성을 위해 넣어 둔 중복 제목 등을 걸러낼 때 쓴다.
   */
  exclude?: string;
  /**
   * 본문이 늦게 도착하는 경우(lazy import / Suspense / 스트리밍)를 대비해
   * MutationObserver 로 DOM 변화를 감시하며 목차를 다시 수집할지 (기본 true).
   *
   * 끄면 마운트 직후 한 번만 수집한다 — 본문이 이미 전부 있는 화면에서는
   * 이쪽이 약간 더 싸다.
   */
  observe?: boolean;
  /** 활성 항목 추적 활성화 */
  activeTracking?: boolean;
  /** 상단 라벨 */
  title?: string;
  /** 클릭 시 부드러운 스크롤 */
  smooth?: boolean;
  /** 스크롤 시 헤딩 위에 남길 여백 (px). 고정 헤더 높이만큼 주면 된다 */
  scrollOffset?: number;
  /** 수집된 항목이 바뀔 때 호출 (바깥에서 "목차 없음" UI 를 그릴 때 유용) */
  onItemsChange?: (items: TocItem[]) => void;
  /** 항목이 하나도 없을 때 렌더할 내용 (기본: 아무것도 렌더하지 않음) */
  emptyFallback?: React.ReactNode;
}

/** 같은 제목이 여러 번 나와도 id 가 겹치지 않도록 슬러그를 만든다 */
function slugify(text: string, used: Set<string>): string {
  const base =
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w가-힣-]/g, "") || "section";
  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

/**
 * 자동 생성 목차 (헤딩 수집 + IntersectionObserver 기반 활성 항목 추적).
 *
 * 본문이 lazy import / Suspense 로 늦게 도착해도 MutationObserver 로 다시
 * 수집하므로, 마운트 시점에 헤딩이 없어도 목차가 비어 있는 채로 남지 않는다.
 * id 가 없는 헤딩에는 슬러그를 붙여 주며, 같은 제목이 여러 번 나와도 id 가
 * 겹치지 않게 번호를 덧붙인다.
 *
 * @example
 * <TableOfContents rootSelector=".article__body" exclude=".sr-only" scrollOffset={76} />
 * @status stable
 * @since 2.3.0
 * @tags navigation
 */
export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>(function TableOfContents(
  {
    items: itemsProp,
    selector = "h2, h3",
    rootSelector,
    exclude,
    observe = true,
    activeTracking = true,
    title = "목차",
    smooth = true,
    scrollOffset = 0,
    onItemsChange,
    emptyFallback = null,
    className,
    ...props
  },
  ref,
) {
  const [items, setItems] = useState<TocItem[]>(itemsProp ?? []);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 콜백을 의존성에 직접 넣으면 인라인 함수를 넘긴 호출부에서 매 렌더 재수집된다
  const onItemsChangeRef = useRef(onItemsChange);
  onItemsChangeRef.current = onItemsChange;

  useEffect(() => {
    if (itemsProp) { setItems(itemsProp); return; }
    if (typeof document === "undefined") return;

    // 직전 수집 결과. 내용이 실제로 달라졌을 때만 setState 해서, MutationObserver 가
    // 잦게 울리는 화면에서도 무한 리렌더로 번지지 않게 한다.
    let last = "";

    const collect = () => {
      const root = rootSelector ? document.querySelector(rootSelector) : document;
      if (!root) return;

      const headings = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (h) => !exclude || !h.matches(exclude),
      );

      const used = new Set<string>();
      const list: TocItem[] = headings
        .filter((h) => h.id || h.textContent?.trim())
        .map((h) => {
          if (h.id) used.add(h.id);
          else h.id = slugify(h.textContent ?? "", used);
          return {
            id: h.id,
            label: h.textContent?.trim() ?? h.id,
            level: parseInt(h.tagName.replace("H", ""), 10) || 2,
          };
        });

      const key = list.map((i) => `${i.level}:${i.id}:${i.label}`).join("|");
      if (key === last) return;
      last = key;
      setItems(list);
      onItemsChangeRef.current?.(list);
    };

    collect();

    if (!observe) return;

    // 본문이 lazy 하게 도착하는 경우 마운트 시점에는 헤딩이 하나도 없다.
    // DOM 이 안정될 때까지 변화를 지켜보며 다시 수집한다.
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(collect);
    });
    const target = rootSelector
      ? (document.querySelector(rootSelector) ?? document.body)
      : document.body;
    mo.observe(target, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
    };
  }, [itemsProp, selector, rootSelector, exclude, observe]);

  useEffect(() => {
    if (!activeTracking || items.length === 0 || typeof window === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items, activeTracking]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    if (!smooth) return;
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    // 프로그래매틱 스크롤이 진행되는 동안 useScrollSpy 가 중간 섹션들을 훑으며
    // 활성 항목을 깜빡이지 않도록 알린다.
    window.dispatchEvent(new Event("scrollspy:manual"));
    setActiveId(id);

    if (scrollOffset) {
      const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    history.replaceState(null, "", `#${id}`);
  };

  if (items.length === 0) return <>{emptyFallback}</>;
  const minLevel = Math.min(...items.map((i) => i.level));

  return (
    <nav
      ref={ref}
      aria-label="목차"
      className={cn("text-sm", className)}
      {...props}
    >
      {title && <div className="mb-2 text-xs uppercase tracking-wider text-muted">{title}</div>}
      <ul className="flex flex-col gap-1">
        {items.map((it) => {
          const isActive = it.id === activeId;
          return (
            <li key={it.id} style={{ paddingLeft: (it.level - minLevel) * 12 }}>
              <a
                href={`#${it.id}`}
                onClick={(e) => handleClick(e, it.id)}
                className={cn(
                  "block py-0.5 truncate border-l-2 pl-2 transition-colors",
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted hover:text-foreground hover:border-border",
                )}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
