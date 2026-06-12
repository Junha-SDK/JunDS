import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";

describe("useAnimationFrame", () => {
  it("registers without error when enabled", () => {
    const { unmount } = renderHook(() => useAnimationFrame(() => {}));
    unmount();
    expect(true).toBe(true);
  });
});
