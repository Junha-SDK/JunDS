import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useWindowSize } from "../../hooks/useWindowSize";

describe("useWindowSize", () => {
  it("returns numbers", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(typeof result.current.width).toBe("number");
    expect(typeof result.current.height).toBe("number");
  });
});
