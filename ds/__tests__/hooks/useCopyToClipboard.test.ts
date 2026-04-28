import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("copied is initially false", () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copied).toBe(false);
  });

  it("sets copied to true after copy", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
    expect(result.current.copied).toBe(true);
  });

  it("resets copied to false after timeout", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopyToClipboard(1000));

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);

    vi.useRealTimers();
  });

  it("uses default timeout of 2000ms", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("text");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);

    vi.useRealTimers();
  });
});
