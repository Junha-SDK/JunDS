import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BookShelf } from "../../composites/BookShelf";

describe("BookShelf", () => {
  it("renders", () => {
    const { container } = render(<BookShelf>book</BookShelf>);
    expect(container.firstChild).toBeTruthy();
  });
});
