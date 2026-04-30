import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

describe("useDocumentTitle", () => {
  beforeEach(() => { document.title = "original"; });

  it("sets title", () => {
    renderHook(() => useDocumentTitle("new"));
    expect(document.title).toBe("new");
  });

  it("restores on unmount when restoreOnUnmount", () => {
    const { unmount } = renderHook(() => useDocumentTitle("temp", { restoreOnUnmount: true }));
    expect(document.title).toBe("temp");
    unmount();
    expect(document.title).toBe("original");
  });
});
