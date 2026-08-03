import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBreakpoint, useBreakpointValue } from "@/ds/hooks/useBreakpoint";

const originalWidth = window.innerWidth;

function setWidth(w: number) {
  Object.defineProperty(window, "innerWidth", { value: w, writable: true, configurable: true });
}

afterEach(() => setWidth(originalWidth));

describe("useBreakpoint", () => {
  it.each([
    [500, "sm"],
    [800, "md"],
    [1100, "lg"],
    [1300, "xl"],
    [1600, "2xl"],
  ] as const)("width %ipx resolves to %s", (width, expected) => {
    setWidth(width);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe(expected);
  });

  it("updates on window resize", () => {
    setWidth(1600);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe("2xl");

    act(() => {
      setWidth(700);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe("sm");
  });
});

describe("useBreakpointValue", () => {
  it("reflects the matchMedia result (stubbed false in jsdom)", () => {
    const { result } = renderHook(() => useBreakpointValue("lg"));
    expect(result.current).toBe(false);
  });
});
