import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useInfiniteFeed } from "../../hooks/useInfiniteFeed";

describe("useInfiniteFeed", () => {
  it("loads first page automatically", async () => {
    const fetchPage = async (cursor: string | number | null | undefined) => ({
      items: cursor ? [] : [{ id: "1" }, { id: "2" }],
      nextCursor: null,
    });
    const { result } = renderHook(() => useInfiniteFeed({ fetchPage, getKey: (i) => i.id }));
    await waitFor(() => expect(result.current.items.length).toBe(2));
    expect(result.current.hasMore).toBe(false);
  });
});
