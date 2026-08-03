import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTimeout } from "../../hooks/useTimeout";

describe("useTimeout", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("invokes callback after delay", () => {
    const cb = vi.fn();
    renderHook(() => useTimeout(cb, 500));
    expect(cb).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("does not run when delay is null", () => {
    const cb = vi.fn();
    renderHook(() => useTimeout(cb, null));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it("clear cancels pending timeout", () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useTimeout(cb, 500));
    act(() => {
      result.current.clear();
      vi.advanceTimersByTime(500);
    });
    expect(cb).not.toHaveBeenCalled();
  });
});
