import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BookRating } from "../../composites/BookRating";

describe("BookRating", () => {
  it("renders", () => {
    const { container } = render(<BookRating value={4.2} reviews={100} />);
    expect(container.firstChild).toBeTruthy();
  });
});
