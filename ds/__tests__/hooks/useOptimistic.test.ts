import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useOptimisticState } from "../../hooks/useOptimistic";

describe("useOptimisticState", () => {
  it("applies optimistic update and commits on success", async () => {
    const { result } = renderHook(() => useOptimisticState({ count: 0 }));
    await act(async () => {
      await result.current[1].run(
        (cur) => ({ count: cur.count + 1 }),
        async () => {},
      );
    });
    expect(result.current[0].count).toBe(1);
  });

  it("rolls back on failure", async () => {
    const { result } = renderHook(() => useOptimisticState({ count: 0 }));
    await act(async () => {
      try {
        await result.current[1].run(
          (cur) => ({ count: cur.count + 5 }),
          async () => { throw new Error("nope"); },
        );
      } catch {}
    });
    expect(result.current[0].count).toBe(0);
  });
});
