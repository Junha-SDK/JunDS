import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAsync } from "../../hooks/useAsync";

describe("useAsync", () => {
  it("resolves and exposes data", async () => {
    const fn = vi.fn(async (n: number) => n * 2);
    const { result } = renderHook(() => useAsync(fn));
    expect(result.current.status).toBe("idle");
    await act(async () => {
      await result.current.execute(5);
    });
    expect(result.current.data).toBe(10);
    expect(result.current.status).toBe("success");
  });

  it("captures errors", async () => {
    const fn = vi.fn(async () => {
      throw new Error("boom");
    });
    const { result } = renderHook(() => useAsync(fn));
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.error?.message).toBe("boom");
    expect(result.current.status).toBe("error");
  });

  it("ignores stale results from earlier calls", async () => {
    let resolveSlow: (v: number) => void = () => {};
    const slow = new Promise<number>((r) => {
      resolveSlow = r;
    });
    const fast = Promise.resolve(99);
    let invocations = 0;
    const fn = vi.fn(async () => {
      invocations++;
      return invocations === 1 ? slow : fast;
    });
    const { result } = renderHook(() => useAsync(fn));
    await act(async () => {
      const p1 = result.current.execute();
      await result.current.execute();
      resolveSlow(1);
      await p1;
    });
    await waitFor(() => expect(result.current.data).toBe(99));
  });
});
