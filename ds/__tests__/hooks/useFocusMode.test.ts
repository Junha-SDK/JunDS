import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useFocusMode } from "../../hooks/useFocusMode";

/** matchMedia 를 지정한 뷰포트 폭 기준으로 흉내낸다 */
function mockViewport(width: number) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    const max = Number(/max-width:\s*(\d+)px/.exec(query)?.[1] ?? Infinity);
    return {
      matches: width <= max,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    };
  });
}

describe("useFocusMode", () => {
  // jsdom 의 localStorage 는 이 환경에서 clear() 를 제공하지 않아 직접 갈아 끼운다
  let store: Record<string, string> = {};
  const originalLocalStorage = window.localStorage;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    store = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (i: number) => Object.keys(store)[i] ?? null,
      },
      writable: true,
      configurable: true,
    });
    mockViewport(1440);
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    window.matchMedia = originalMatchMedia;
  });

  it("starts disabled and toggles", () => {
    const { result } = renderHook(() => useFocusMode());
    expect(result.current.enabled).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.enabled).toBe(true);
  });

  it("exposes focusMode / toggleFocusMode aliases", () => {
    const { result } = renderHook(() => useFocusMode());
    act(() => result.current.toggleFocusMode());
    expect(result.current.focusMode).toBe(true);
    expect(result.current.focusMode).toBe(result.current.enabled);
  });

  it("persists to localStorage by default", () => {
    const { result, unmount } = renderHook(() => useFocusMode());
    act(() => result.current.enable());
    expect(localStorage.getItem("ds-focus-mode")).toBe("true");
    unmount();

    const second = renderHook(() => useFocusMode());
    expect(second.result.current.enabled).toBe(true);
  });

  it("does not persist when persist is false", () => {
    const { result } = renderHook(() => useFocusMode({ persist: false }));
    act(() => result.current.enable());
    expect(localStorage.getItem("ds-focus-mode")).toBeNull();
  });

  it("toggles on Cmd/Ctrl + .", () => {
    const { result } = renderHook(() => useFocusMode());
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: ".", metaKey: true }));
    });
    expect(result.current.enabled).toBe(true);
  });

  it("ignores the shortcut when shortcut is false", () => {
    const { result } = renderHook(() => useFocusMode({ shortcut: false }));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: ".", metaKey: true }));
    });
    expect(result.current.enabled).toBe(false);
  });

  it("stays off below disableBelow even when enabled", () => {
    mockViewport(600);
    const { result } = renderHook(() => useFocusMode({ disableBelow: 900 }));
    act(() => result.current.enable());
    // 상태는 켜졌지만 좁은 화면에서는 효력이 없다
    expect(result.current.enabled).toBe(false);
  });

  it("keeps working on narrow screens when disableBelow is 0 (default)", () => {
    mockViewport(600);
    const { result } = renderHook(() => useFocusMode());
    act(() => result.current.enable());
    expect(result.current.enabled).toBe(true);
  });

  it("never peeks while peek is off", () => {
    const { result } = renderHook(() => useFocusMode());
    act(() => result.current.enable());
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 2 }));
    });
    expect(result.current.peekLeft).toBe(false);
  });

  it("peeks left when the pointer hits the edge and peek is on", () => {
    const { result } = renderHook(() => useFocusMode({ peek: true }));
    act(() => result.current.enable());
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 2 }));
    });
    expect(result.current.peekLeft).toBe(true);
  });
});
