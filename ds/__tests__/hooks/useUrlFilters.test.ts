import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useUrlFilters } from "../../hooks/useUrlFilters";

const search = () => window.location.search;

const setUrl = (url: string) => {
  window.history.replaceState(null, "", url);
};

describe("useUrlFilters", () => {
  beforeEach(() => {
    setUrl("/");
  });

  it("starts from the defaults when the URL is empty", () => {
    const { result } = renderHook(() =>
      useUrlFilters({ category: "all", sort: "desc", q: "" }),
    );
    expect(result.current.filters).toEqual({ category: "all", sort: "desc", q: "" });
    expect(result.current.isDirty).toBe(false);
  });

  it("reads initial values from the URL", () => {
    setUrl("/?category=book&q=검색어");
    const { result } = renderHook(() =>
      useUrlFilters({ category: "all", sort: "desc", q: "" }),
    );
    expect(result.current.filters.category).toBe("book");
    expect(result.current.filters.q).toBe("검색어");
    expect(result.current.activeCount).toBe(2);
  });

  it("keeps defaults out of the URL", () => {
    const { result } = renderHook(() => useUrlFilters({ category: "all", sort: "desc" }));
    act(() => result.current.set("category", "book"));
    expect(search()).toBe("?category=book");
    // sort 는 기본값 그대로라 실리지 않는다
    expect(search()).not.toContain("sort");
  });

  it("drops a key from the URL when it returns to its default", () => {
    setUrl("/?category=book");
    const { result } = renderHook(() => useUrlFilters({ category: "all" }));
    act(() => result.current.set("category", "all"));
    expect(search()).toBe("");
  });

  it("coerces numbers and booleans from the URL", () => {
    setUrl("/?page=3&only=1");
    const { result } = renderHook(() => useUrlFilters({ page: 1, only: false }));
    expect(result.current.filters.page).toBe(3);
    expect(result.current.filters.only).toBe(true);
  });

  it("falls back to the default when parse rejects a value", () => {
    setUrl("/?sort=엉뚱한값");
    const { result } = renderHook(() =>
      useUrlFilters(
        { sort: "desc" },
        { parse: { sort: (raw) => (raw === "asc" || raw === "desc" ? raw : undefined) } },
      ),
    );
    expect(result.current.filters.sort).toBe("desc");
  });

  it("never writes transient keys to the URL", () => {
    const { result } = renderHook(() =>
      useUrlFilters({ status: "all", q: "" }, { transient: ["status"] }),
    );
    act(() => result.current.patch({ status: "draft", q: "x" }));
    expect(result.current.filters.status).toBe("draft");
    expect(search()).toBe("?q=x");
  });

  it("resets everything back to defaults", () => {
    setUrl("/?category=book&q=x");
    const { result } = renderHook(() => useUrlFilters({ category: "all", q: "" }));
    act(() => result.current.reset());
    expect(result.current.filters).toEqual({ category: "all", q: "" });
    expect(search()).toBe("");
  });

  it("prefixes params when asked", () => {
    const { result } = renderHook(() =>
      useUrlFilters({ q: "" }, { prefix: "left_" }),
    );
    act(() => result.current.set("q", "x"));
    expect(search()).toBe("?left_q=x");
  });

  it("counts only the filters that differ from their defaults", () => {
    const { result } = renderHook(() => useUrlFilters({ a: "1", b: "2", c: "3" }));
    act(() => result.current.patch({ a: "9", b: "8" }));
    expect(result.current.activeCount).toBe(2);
    expect(result.current.isDirty).toBe(true);
  });
});
