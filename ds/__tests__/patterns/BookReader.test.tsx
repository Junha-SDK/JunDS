import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BookReader } from "../../patterns/BookReader";

describe("BookReader", () => {
  it("renders", () => {
    const { container } = render(
      <BookReader
        title="모비 딕"
        chapters={[{ id: "ch-1", title: "1장" }]}
        activeChapterId="ch-1"
        onChapterChange={() => {}}
        currentPage={10}
        totalPages={300}
      >
        본문
      </BookReader>,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("renders nothing (with a dev warning) when chapters is empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <BookReader
        title="빈 책"
        chapters={[]}
        activeChapterId=""
        onChapterChange={() => {}}
        currentPage={0}
        totalPages={0}
      >
        본문
      </BookReader>,
    );
    expect(container.firstChild).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("chapters"));
    warn.mockRestore();
  });
});
