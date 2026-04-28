import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useLocalStorage } from "../../hooks/useLocalStorage";

describe("useLocalStorage", () => {
  let store: Record<string, string> = {};
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    store = {};
    const mock = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
      get length() { return Object.keys(store).length; },
      key: (i: number) => Object.keys(store)[i] ?? null,
    };
    Object.defineProperty(window, "localStorage", { value: mock, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, "localStorage", { value: originalLocalStorage, writable: true, configurable: true });
  });

  it("returns initial value when key is not in localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("returns stored value when key exists in localStorage", () => {
    window.localStorage.setItem("test-key", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("stored");
  });

  it("sets value and updates localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    act(() => result.current[1]("updated"));
    expect(result.current[0]).toBe("updated");
    expect(JSON.parse(window.localStorage.getItem("test-key")!)).toBe("updated");
  });

  it("supports function updater", () => {
    const { result } = renderHook(() => useLocalStorage("counter", 0));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(1);
  });

  it("works with object values", () => {
    const initial = { name: "test", count: 0 };
    const { result } = renderHook(() => useLocalStorage("obj-key", initial));
    expect(result.current[0]).toEqual(initial);

    const updated = { name: "updated", count: 5 };
    act(() => result.current[1](updated));
    expect(result.current[0]).toEqual(updated);
  });

  it("falls back to initial value on invalid JSON", () => {
    window.localStorage.setItem("bad-key", "not valid json");
    const { result } = renderHook(() => useLocalStorage("bad-key", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });
});
