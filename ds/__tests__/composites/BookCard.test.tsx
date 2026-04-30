import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BookCard } from "../../composites/BookCard";

describe("BookCard", () => {
  it("renders without throwing", () => {
    const { container } = render(<BookCard title="" />);
    expect(container.firstChild).toBeDefined();
  });
});
