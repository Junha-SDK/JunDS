import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useKeyboardShortcut } from "../../hooks/useKeyboardShortcut";

describe("useKeyboardShortcut", () => {
  it("registers without throwing", () => {
    const { unmount } = renderHook(() => useKeyboardShortcut("mod+k", () => {}));
    unmount();
    expect(true).toBe(true);
  });
});
