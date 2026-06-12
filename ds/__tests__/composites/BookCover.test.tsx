import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BookCover } from "../../composites/BookCover";

describe("BookCover", () => {
  it("renders", () => {
    const { container } = render(<BookCover title="제목" />);
    expect(container.firstChild).toBeTruthy();
  });
});
