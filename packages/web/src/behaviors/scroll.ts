/**
 * 스크롤 파생 계열 (v2 useScrollSpy·useReadingProgress·useInfiniteFeed).
 *
 * 셋 다 스크롤을 읽어 파생값을 만든다 — 측정은 rAF로 합치고(스크롤 이벤트마다
 * 레이아웃을 읽으면 강제 리플로가 난다) 리스너는 passive로 붙인다(05-perf).
 */
import { createWatcher, type Watcher } from "./subscribe.js";
import type { Behavior } from "./types.js";

/** 스크롤 이벤트를 rAF 한 번으로 합쳐 측정 콜백을 부른다 */
function onScrollMeasured(measure: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  let raf = 0;
  const on = (): void => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      measure();
    });
  };
  window.addEventListener("scroll", on, { passive: true });
  window.addEventListener("resize", on, { passive: true });
  measure();
  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener("scroll", on);
    window.removeEventListener("resize", on);
  };
}

export interface ScrollSpyOptions {
  /** 활성 판정 상단 여백(px). v2 기본 0 */
  offset?: number;
}

/**
 * 현재 보고 있는 섹션 id (v2 useScrollSpy).
 * v2는 ToC 클릭 시 700ms 스파이를 끄려고 커스텀 이벤트를 썼는데, 그 결합은
 * 호출부가 `suspend()`를 부르는 명시적 표면으로 바꿨다 — 전역 이벤트 이름 규약이
 * 라이브러리와 앱 사이에 숨은 계약이 되지 않도록.
 */
export function createScrollSpy(
  selectors: string[],
  opts: ScrollSpyOptions = {},
): Watcher<string | null> & { suspend(ms: number): void } {
  const offset = opts.offset ?? 0;
  let suspendUntil = 0;
  let setValue: ((v: string | null) => void) | null = null;

  const resolve = (): string | null => {
    if (typeof document === "undefined") return null;
    let active: string | null = null;
    for (const sel of selectors) {
      const el = sel.startsWith("#") || sel.startsWith(".")
        ? document.querySelector(sel)
        : document.getElementById(sel);
      if (!el) continue;
      if (el.getBoundingClientRect().top - offset <= 0) active = el.id || sel.replace(/^#/, "");
      else break; // 문서 순서대로라 첫 미도달에서 끊는다
    }
    return active ?? (selectors[0]?.replace(/^#/, "") ?? null);
  };

  const watcher = createWatcher<string | null>(resolve(), (set) => {
    setValue = set;
    return onScrollMeasured(() => {
      if (Date.now() < suspendUntil) return;
      set(resolve());
    });
  });

  return {
    ...watcher,
    suspend(ms: number) {
      // 프로그래매틱 스크롤(ToC 클릭) 동안 하이라이트가 요동치지 않게 잠시 멈춘다
      suspendUntil = Date.now() + ms;
      void setValue;
    },
  };
}

export interface ReadingProgress {
  /** 0~100 */
  percent: number;
  /** 현재 위치의 제목 id */
  headingId: string | null;
}

export interface ReadingProgressOptions {
  /** 스크롤 컨테이너. 미지정이면 문서 전체 */
  container?: HTMLElement | null;
  /** 제목 판정 상단 여백. v2 기본 80 */
  offset?: number;
}

export function createReadingProgress(
  article: ParentNode,
  opts: ReadingProgressOptions = {},
): Watcher<ReadingProgress> {
  const offset = opts.offset ?? 80;
  const HEADINGS = "h1[id], h2[id], h3[id]";
  let last: ReadingProgress = { percent: 0, headingId: null };

  const measure = (): ReadingProgress => {
    if (typeof document === "undefined") return last;
    const box = opts.container;
    const max = box
      ? box.scrollHeight - box.clientHeight
      : document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const top = box ? box.scrollTop : document.documentElement.scrollTop;
    const percent = max > 0 ? Math.min(100, Math.max(0, (top / max) * 100)) : 0;

    let headingId: string | null = null;
    const headings = Array.from(article.querySelectorAll<HTMLElement>(HEADINGS));
    for (const h of headings) {
      if (h.getBoundingClientRect().top - offset <= 0) headingId = h.id;
      else break;
    }
    return { percent, headingId: headingId ?? headings[0]?.id ?? null };
  };

  return createWatcher<ReadingProgress>(measure(), (set) =>
    onScrollMeasured(() => {
      const next = measure();
      if (next.percent === last.percent && next.headingId === last.headingId) return;
      last = next;
      set(next);
    }),
  );
}

export interface InfiniteFeedOptions {
  /** 바닥에서 이 거리 안에 들어오면 더 불러온다(px) */
  rootMargin?: string;
}

/**
 * 무한 스크롤 트리거 (v2 useInfiniteFeed의 관찰 부분).
 * v2 훅은 페이지네이션 상태(items·cursor·hasMore)까지 들고 있었지만 그건 **데이터
 * 계층의 일**이다 — 바닐라 Behavior는 "바닥에 닿았다"만 알리고, 중복 호출 방지
 * (in-flight 가드)만 책임진다. 목록 상태는 호출부·스토어가 갖는다.
 */
export function createInfiniteFeed(
  sentinel: Element,
  loadMore: () => Promise<void> | void,
  opts: InfiniteFeedOptions = {},
): Behavior {
  if (typeof IntersectionObserver === "undefined") return { destroy: () => {} };
  let busy = false;
  const io = new IntersectionObserver(
    async (entries) => {
      if (busy || !entries.some((e) => e.isIntersecting)) return;
      busy = true;
      try {
        await loadMore();
      } finally {
        busy = false;
      }
    },
    { rootMargin: opts.rootMargin ?? "200px" },
  );
  io.observe(sentinel);
  let destroyed = false;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      io.disconnect();
    },
  };
}
