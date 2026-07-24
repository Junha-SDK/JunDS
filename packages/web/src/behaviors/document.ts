/**
 * 문서 전역 유틸 (v2 useScrollLock·useDocumentTitle·useFavicon·useFullscreen·
 * useClipboard=useCopyToClipboard·useImagePreload).
 *
 * 전부 "되돌리는 함수를 반환"하는 형태다 — React의 cleanup을 바닐라로 옮기면
 * 그게 가장 정직한 모양이고, 호출부가 Behavior로 감쌀 수도 있다.
 */
import type { Behavior } from "./types.js";

/* ─── 스크롤 락 ─── */
let lockCount = 0;
let savedOverflow = "";
let savedPadding = "";

/**
 * body 스크롤 잠금. **중첩 안전**(모달 위 모달) — v2와 같은 참조 계수 방식이며
 * 스크롤바 폭만큼 padding을 보정해 레이아웃 점프를 막는다.
 */
export function lockScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  if (lockCount === 0) {
    const body = document.body;
    const barWidth = window.innerWidth - document.documentElement.clientWidth;
    savedOverflow = body.style.overflow;
    savedPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (barWidth > 0) body.style.paddingRight = `${barWidth}px`;
  }
  lockCount += 1;
  let released = false;
  return () => {
    if (released) return; // 멱등
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = savedOverflow;
      document.body.style.paddingRight = savedPadding;
    }
  };
}

/** 문서 제목 교체 + 복원 함수 반환 (v2 useDocumentTitle) */
export function setDocumentTitle(title: string): () => void {
  if (typeof document === "undefined") return () => {};
  const previous = document.title;
  document.title = title;
  return () => {
    document.title = previous;
  };
}

/** 파비콘 교체 + 복원 함수 반환 (v2 useFavicon) */
export function setFavicon(href: string): () => void {
  if (typeof document === "undefined") return () => {};
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  const created = !link;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.append(link);
  }
  const previous = link.href;
  link.href = href;
  return () => {
    if (created) link!.remove();
    else link!.href = previous;
  };
}

export interface Fullscreen extends Behavior {
  readonly supported: boolean;
  isActive(): boolean;
  enter(): Promise<void>;
  exit(): Promise<void>;
  toggle(): Promise<void>;
  subscribe(fn: (active: boolean) => void): () => void;
}

export function createFullscreen(el?: Element): Fullscreen {
  const doc = typeof document !== "undefined" ? document : null;
  const subs = new Set<(active: boolean) => void>();
  const isActive = (): boolean => Boolean(doc?.fullscreenElement);
  const onChange = (): void => {
    for (const fn of subs) fn(isActive());
  };
  doc?.addEventListener("fullscreenchange", onChange);
  let destroyed = false;

  return {
    supported: Boolean(doc?.fullscreenEnabled),
    isActive,
    async enter() {
      const target = el ?? doc?.documentElement;
      // 권한 거부·미지원은 reject된다 — 호출부가 삼키지 않도록 그대로 전파
      if (target?.requestFullscreen) await target.requestFullscreen();
    },
    async exit() {
      if (doc?.fullscreenElement) await doc.exitFullscreen();
    },
    async toggle() {
      if (isActive()) await this.exit();
      else await this.enter();
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      subs.clear();
      doc?.removeEventListener("fullscreenchange", onChange);
    },
  };
}

/**
 * 클립보드 복사 (v2 useClipboard = useCopyToClipboard 통합).
 * v2는 실패를 그대로 던져 unhandled rejection을 만들었다 — 성공 여부를 boolean으로
 * 돌려준다(jd-copy-button과 같은 판단, DEC-029-7).
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function readText(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

export interface PreloadResult {
  loaded: string[];
  failed: string[];
}

/** 동시 개수를 제한한 이미지 프리로드 (v2 useImagePreload — 기본 3) */
export async function preloadImages(urls: string[], concurrency = 3): Promise<PreloadResult> {
  const loaded: string[] = [];
  const failed: string[] = [];
  if (typeof Image === "undefined") return { loaded, failed };
  const queue = [...urls];

  const worker = async (): Promise<void> => {
    for (;;) {
      const url = queue.shift();
      if (!url) return;
      const ok = await new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
      (ok ? loaded : failed).push(url);
    }
  };

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return { loaded, failed };
}
