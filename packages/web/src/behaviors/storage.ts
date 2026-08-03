/**
 * 저장소 계열 (v2 useLocalStorage·useSessionStorage·useCookie).
 *
 * v2는 local/session 두 훅이 거의 같은 코드였다 — storage 인자 하나로 통합한다
 * (00-inventory §4 "createStoredValue(storage: session) 변형").
 * 탭 간 동기화(storage 이벤트)는 v2 session 훅에만 있었지만 local이 더 필요한
 * 기능이라 양쪽에 준다 — 상위집합.
 */
import type { Behavior } from "./types.js";

export interface StoredValue<T> extends Behavior {
  get(): T;
  set(value: T): void;
  /** 저장소에서 제거하고 초기값으로 되돌린다 */
  remove(): void;
  subscribe(fn: (value: T) => void): () => void;
}

export interface StoredValueOptions {
  /** 기본 localStorage */
  storage?: "local" | "session";
}

export function createStoredValue<T>(
  key: string,
  initial: T,
  opts: StoredValueOptions = {},
): StoredValue<T> {
  const area: Storage | null =
    typeof window === "undefined"
      ? null
      : opts.storage === "session"
      ? window.sessionStorage
      : window.localStorage;

  const read = (): T => {
    if (!area) return initial;
    try {
      const raw = area.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial; // 손상된 JSON·접근 거부는 초기값으로 흡수(v2 동형)
    }
  };

  let value = read();
  let destroyed = false;
  const subs = new Set<(v: T) => void>();
  const emit = (): void => {
    for (const fn of subs) fn(value);
  };

  const onStorage = (e: StorageEvent): void => {
    if (e.key !== key || e.storageArea !== area) return;
    value = read(); // 다른 탭의 변경 반영
    emit();
  };
  if (area && typeof window !== "undefined") window.addEventListener("storage", onStorage);

  return {
    get: () => value,
    set(next) {
      value = next;
      try {
        area?.setItem(key, JSON.stringify(next));
      } catch {
        // 용량 초과·사생활 모드 — 메모리 값은 유지한다(v2 동형)
      }
      emit();
    },
    remove() {
      value = initial;
      try {
        area?.removeItem(key);
      } catch {
        /* 무시 */
      }
      emit();
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      subs.clear();
      if (area && typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    },
  };
}

export interface CookieOptions {
  days?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

/** v2 readCookie 이식 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** v2 writeCookie 이식 — path 기본 "/" */
export function setCookie(name: string, value: string, opts: CookieOptions = {}): void {
  if (typeof document === "undefined") return;
  let str = `${name}=${encodeURIComponent(value)}`;
  const expires =
    opts.expires ??
    (opts.days !== undefined ? new Date(Date.now() + opts.days * 86_400_000) : undefined);
  if (expires) str += `; expires=${expires.toUTCString()}`;
  str += `; path=${opts.path ?? "/"}`;
  if (opts.domain) str += `; domain=${opts.domain}`;
  if (opts.secure) str += "; secure";
  if (opts.sameSite) str += `; samesite=${opts.sameSite}`;
  document.cookie = str;
}

export function removeCookie(name: string, opts: CookieOptions = {}): void {
  setCookie(name, "", { ...opts, days: -1 });
}
