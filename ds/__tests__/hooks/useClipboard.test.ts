import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClipboard } from "@/ds/hooks/useClipboard";

const writeText = vi.fn().mockResolvedValue(undefined);
const readText = vi.fn().mockResolvedValue("클립보드 내용");

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText, readText },
    configurable: true,
  });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useClipboard", () => {
  it("copy writes to the clipboard and sets copied", async () => {
    const { result } = renderHook(() => useClipboard());
    await act(() => result.current.copy("안녕"));
    expect(writeText).toHaveBeenCalledWith("안녕");
    expect(result.current.copied).toBe(true);
  });

  it("copied resets after the timeout", async () => {
    const { result } = renderHook(() => useClipboard(1000));
    await act(() => result.current.copy("x"));
    expect(result.current.copied).toBe(true);
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.copied).toBe(false);
  });

  it("read returns the clipboard text", async () => {
    const { result } = renderHook(() => useClipboard());
    let text = "";
    await act(async () => {
      text = await result.current.read();
    });
    expect(text).toBe("클립보드 내용");
  });
});
