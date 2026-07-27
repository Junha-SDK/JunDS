import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useJsonLd } from "../../hooks/useJsonLd";

const scripts = (key: string) =>
  document.querySelectorAll(`script[data-jsonld="${key}"]`);

describe("useJsonLd", () => {
  it("injects a script tag with the serialized payload", () => {
    renderHook(() => useJsonLd("article", { "@type": "BlogPosting", headline: "제목" }));
    const el = scripts("article")[0];
    expect(el).toBeTruthy();
    expect(el.getAttribute("type")).toBe("application/ld+json");
    expect(JSON.parse(el.textContent!)).toEqual({
      "@type": "BlogPosting",
      headline: "제목",
    });
  });

  it("removes the script on unmount", () => {
    const { unmount } = renderHook(() => useJsonLd("gone", { a: 1 }));
    expect(scripts("gone")).toHaveLength(1);
    unmount();
    expect(scripts("gone")).toHaveLength(0);
  });

  it("does not re-inject when an equal object literal is passed again", () => {
    const { rerender } = renderHook(() => useJsonLd("stable", { a: 1 }));
    const first = scripts("stable")[0];
    rerender();
    expect(scripts("stable")[0]).toBe(first);
  });

  it("replaces rather than duplicates when the payload changes", () => {
    const { rerender } = renderHook(({ n }) => useJsonLd("changing", { n }), {
      initialProps: { n: 1 },
    });
    rerender({ n: 2 });
    expect(scripts("changing")).toHaveLength(1);
    expect(JSON.parse(scripts("changing")[0].textContent!)).toEqual({ n: 2 });
  });

  it("injects nothing for a null payload", () => {
    renderHook(() => useJsonLd("empty", null));
    expect(scripts("empty")).toHaveLength(0);
  });
});
