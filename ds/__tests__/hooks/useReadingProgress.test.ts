import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useReadingProgress } from "../../hooks/useReadingProgress";

describe("useReadingProgress", () => {
  it("returns initial 0 progress", () => {
    const { result } = renderHook(() => useReadingProgress());
    expect(result.current.progress).toBe(0);
    expect(result.current.activeHeadingId).toBe(null);
  });
});
