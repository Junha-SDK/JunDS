import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useImagePreload } from "../../hooks/useImagePreload";

describe("useImagePreload", () => {
  it("starts with empty loaded set", () => {
    const { result } = renderHook(() => useImagePreload([]));
    expect(result.current.loaded.size).toBe(0);
    expect(result.current.failed.size).toBe(0);
  });
});
