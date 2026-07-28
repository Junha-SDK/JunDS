/**
 * 입력·포인터 계열 (v2 useEventListener·useClickOutside·useKeyboard·useHotkeys
 * =useKeyboardShortcut·useLongPress·useHover·useFocusVisible).
 *
 * 키 조합 표기는 v2 useHotkeys의 정규화를 그대로 승계한다("mod"→플랫폼별 meta/ctrl,
 * cmd/control/option/esc/space 별칭, 정렬 후 결합). useKeyboard(단일 조합 객체)는
 * 같은 엔진의 얇은 표면이라 createKeyHandler로 통합했다.
 */
import type { Behavior } from "./types.js";

/** v2 useEventListener — 해제 함수를 돌려주는 얇은 유틸 */
export function on<K extends keyof WindowEventMap>(
  target: EventTarget,
  type: K | string,
  fn: (event: never) => void,
  options?: boolean | AddEventListenerOptions,
): () => void {
  const listener = fn as EventListener;
  target.addEventListener(type as string, listener, options);
  return () => target.removeEventListener(type as string, listener, options);
}

/** 바깥 클릭 감지 (v2 useClickOutside — mousedown/touchstart 두 경로 동형) */
export function createClickOutside(el: Element, onOutside: (e: Event) => void): Behavior {
  const listener = (e: Event): void => {
    const t = e.target as Node | null;
    if (!t || el.contains(t)) return;
    onOutside(e);
  };
  const doc = el.ownerDocument;
  doc.addEventListener("mousedown", listener);
  doc.addEventListener("touchstart", listener);
  let destroyed = false;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      doc.removeEventListener("mousedown", listener);
      doc.removeEventListener("touchstart", listener);
    },
  };
}

const isMac = (): boolean =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

/** "mod+k" → "k+meta" 같은 정렬 결합키 (v2 normalizeChord 이식) */
export function normalizeChord(chord: string): string {
  return chord
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .map((p) => {
      if (p === "mod") return isMac() ? "meta" : "ctrl";
      if (p === "cmd") return "meta";
      if (p === "control") return "ctrl";
      if (p === "option") return "alt";
      if (p === "esc") return "escape";
      if (p === "space") return " ";
      return p;
    })
    .sort()
    .join("+");
}

function eventToChord(e: KeyboardEvent): string | null {
  // IME 조합·일부 미디어 키에서 key가 문자열이 아닐 수 있다 — 전역 리스너가
  // 여기서 터지면 페이지 전체 입력이 막힌다(v2 주석의 실사고)
  if (typeof e.key !== "string") return null;
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("ctrl");
  if (e.metaKey) parts.push("meta");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  const key = e.key.toLowerCase();
  if (!["control", "meta", "alt", "shift"].includes(key)) parts.push(key);
  return parts.sort().join("+");
}

export type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

export interface HotkeyOptions {
  /** 입력 요소 안에서도 동작시킬지. 기본 false(v2 동형) */
  enableOnFormTags?: boolean;
  /** 부착 대상. 기본 document */
  target?: EventTarget;
  /** 일치 시 기본 동작 취소. 기본 true */
  preventDefault?: boolean;
}

/** v2 useHotkeys = useKeyboardShortcut 통합 구현 (00-inventory §4 중복 통합) */
export function createHotkeys(map: HotkeyMap, opts: HotkeyOptions = {}): Behavior<HotkeyMap> {
  const target = opts.target ?? (typeof document !== "undefined" ? document : null);
  let table = new Map<string, (e: KeyboardEvent) => void>();
  const rebuild = (next: HotkeyMap): void => {
    table = new Map(Object.entries(next).map(([k, v]) => [normalizeChord(k), v]));
  };
  rebuild(map);

  const handler = (evt: Event): void => {
    const e = evt as KeyboardEvent;
    if (!opts.enableOnFormTags) {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
    }
    const chord = eventToChord(e);
    if (!chord) return;
    const fn = table.get(chord);
    if (!fn) return;
    if (opts.preventDefault !== false) e.preventDefault();
    fn(e);
  };

  target?.addEventListener("keydown", handler);
  let destroyed = false;
  return {
    update(next) {
      rebuild(next as HotkeyMap);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      target?.removeEventListener("keydown", handler);
    },
  };
}

/** 요소 스코프 키 핸들러 (v2 useKeyboard) — 같은 조합 엔진의 요소 한정 표면 */
export function createKeyHandler(
  el: EventTarget,
  map: HotkeyMap,
  opts: HotkeyOptions = {},
): Behavior<HotkeyMap> {
  return createHotkeys(map, { ...opts, target: el });
}

export interface LongPressOptions {
  /** ms. v2 기본 500 */
  threshold?: number;
  onStart?: () => void;
  onCancel?: () => void;
}

export function createLongPress(
  el: Element,
  onLongPress: (e: Event) => void,
  opts: LongPressOptions = {},
): Behavior {
  const threshold = opts.threshold ?? 500;
  let id: ReturnType<typeof setTimeout> | undefined;
  let pressed = false;

  const start = (e: Event): void => {
    pressed = true;
    opts.onStart?.();
    id = setTimeout(() => {
      if (pressed) onLongPress(e);
    }, threshold);
  };
  const cancel = (): void => {
    if (!pressed) return;
    pressed = false;
    if (id) clearTimeout(id);
    opts.onCancel?.();
  };

  const pairs: [string, EventListener][] = [
    ["pointerdown", start as EventListener],
    ["pointerup", cancel],
    ["pointerleave", cancel],
    ["pointercancel", cancel],
  ];
  for (const [type, fn] of pairs) el.addEventListener(type, fn);

  let destroyed = false;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (id) clearTimeout(id);
      for (const [type, fn] of pairs) el.removeEventListener(type, fn);
    },
  };
}

export function createHoverWatcher(el: Element, onChange: (hovered: boolean) => void): Behavior {
  const enter = (): void => onChange(true);
  const leave = (): void => onChange(false);
  el.addEventListener("mouseenter", enter);
  el.addEventListener("mouseleave", leave);
  let destroyed = false;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    },
  };
}

/**
 * 키보드 조작 중인지 관찰 (v2 useFocusVisible).
 * CSS :focus-visible이 있는 지금 시각 표현에는 필요 없지만, "지금 키보드 사용자인가"로
 * 동작을 바꾸는 곳(툴팁 유지, 스킵 링크)이 남아 있어 관찰자로 유지한다.
 */
export function createFocusVisible(onChange: (keyboard: boolean) => void): Behavior {
  if (typeof window === "undefined") return { destroy: () => {} };
  const onKey = (e: KeyboardEvent): void => {
    if (e.metaKey || e.altKey || e.ctrlKey) return;
    onChange(true);
  };
  const onPointer = (): void => onChange(false);
  const offs = [
    on(window, "keydown", onKey as (e: never) => void, true),
    on(window, "mousedown", onPointer as (e: never) => void, true),
    on(window, "pointerdown", onPointer as (e: never) => void, true),
    on(window, "touchstart", onPointer as (e: never) => void, true),
  ];
  let destroyed = false;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const off of offs) off();
    },
  };
}
