import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
});
