import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Rating } from "../../composites/Rating";

describe("Rating", () => {
  it("renders without throwing", () => {
    const { container } = render(<Rating value={0} />);
    expect(container.firstChild).toBeDefined();
  });
});
