import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useMutation } from "../../hooks/useMutation";

describe("useMutation", () => {
  it("runs mutation and updates state", async () => {
    const { result } = renderHook(() => useMutation(async (n: number) => n * 2));
    await act(async () => {
      await result.current.mutate(21);
    });
    expect(result.current.data).toBe(42);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });
});
