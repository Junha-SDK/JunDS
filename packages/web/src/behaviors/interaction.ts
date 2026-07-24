/**
 * 상호작용·환경 계열 (v2 usePanelResize·useFocusMode·useGeolocation·useFullscreen 보조).
 */
import { createStoredValue } from "./storage.js";
import { createWatcher, type Watcher } from "./subscribe.js";
import type { Behavior } from "./types.js";

export interface PanelResizeOptions {
  /** v2 기본 280 / 720 */
  min?: number;
  max?: number;
  /** 오른쪽 패널(기본) 대신 왼쪽에서 끌 때 */
  edge?: "start" | "end";
  onResize?: (width: number) => void;
}

/**
 * 드래그 핸들로 패널 폭 조절 (v2 usePanelResize).
 * v2는 mousemove만 들었다 — pointer 이벤트로 바꿔 터치·펜도 동작하고,
 * setPointerCapture로 커서가 핸들을 벗어나도 드래그가 끊기지 않는다(상위집합).
 */
export function createPanelResize(
  handle: HTMLElement,
  panel: HTMLElement,
  opts: PanelResizeOptions = {},
): Behavior {
  const min = opts.min ?? 280;
  const max = opts.max ?? 720;
  const fromEnd = (opts.edge ?? "end") === "end";
  let dragging = false;

  const onDown = (e: PointerEvent): void => {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const raw = fromEnd ? window.innerWidth - e.clientX : e.clientX;
    const width = Math.max(min, Math.min(max, raw));
    panel.style.width = `${width}px`;
    opts.onResize?.(width);
  };
  const onUp = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  handle.addEventListener("pointerdown", onDown);
  handle.addEventListener("pointermove", onMove);
  handle.addEventListener("pointerup", onUp);
  handle.addEventListener("pointercancel", onUp);

  let destroyed = false;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    },
  };
}

export interface FocusModeOptions {
  /** 상태를 반영할 요소. 기본 documentElement — [data-jd-focus-mode] 훅 */
  root?: HTMLElement;
  /** localStorage 키. v2 "ds-focus-mode" 승계 */
  storageKey?: string;
  /** 토글 단축키. 기본 mod+. (v2 동형) */
  hotkey?: string | null;
}

export interface FocusMode extends Watcher<boolean> {
  toggle(): void;
  set(enabled: boolean): void;
}

/** 몰입 모드 (v2 useFocusMode) — 상태 저장 + 루트 attribute + 단축키 */
export function createFocusMode(opts: FocusModeOptions = {}): FocusMode {
  const store = createStoredValue<boolean>(opts.storageKey ?? "ds-focus-mode", false);
  const root = opts.root ?? (typeof document !== "undefined" ? document.documentElement : null);
  const apply = (on: boolean): void => {
    root?.toggleAttribute("data-jd-focus-mode", on);
  };
  apply(store.get());

  const watcher = createWatcher<boolean>(store.get(), (set) => {
    const off = store.subscribe((v) => {
      apply(v);
      set(v);
    });
    if (opts.hotkey === null || typeof document === "undefined") return off;
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        store.set(!store.get());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      off();
      document.removeEventListener("keydown", onKey);
    };
  });

  return {
    ...watcher,
    toggle: () => store.set(!store.get()),
    set: (enabled) => store.set(enabled),
    destroy() {
      watcher.destroy();
      store.destroy();
    },
  };
}

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationState {
  loading: boolean;
  position: GeoPosition | null;
  error: Error | null;
  supported: boolean;
}

export interface GeolocationOptions extends PositionOptions {
  /** 지속 관찰(watchPosition). 기본 false */
  watch?: boolean;
}

export function createGeolocationWatcher(opts: GeolocationOptions = {}): Watcher<GeolocationState> {
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;
  const initial: GeolocationState = { loading: supported, position: null, error: null, supported };

  return createWatcher<GeolocationState>(initial, (set) => {
    if (!supported) {
      set({ ...initial, loading: false, error: new Error("Geolocation not supported") });
      return;
    }
    const ok = (p: GeolocationPosition): void =>
      set({
        loading: false,
        supported,
        error: null,
        position: {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
          timestamp: p.timestamp,
        },
      });
    const fail = (e: GeolocationPositionError): void =>
      set({ loading: false, supported, position: null, error: new Error(e.message) });

    if (opts.watch) {
      const id = navigator.geolocation.watchPosition(ok, fail, opts);
      return () => navigator.geolocation.clearWatch(id);
    }
    navigator.geolocation.getCurrentPosition(ok, fail, opts);
    return;
  });
}
