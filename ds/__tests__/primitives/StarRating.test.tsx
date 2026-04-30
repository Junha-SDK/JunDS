import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StarRating } from "../../primitives/StarRating";

describe("StarRating", () => {
  it("renders without throwing", () => {
    const { container } = render(<StarRating value={0} />);
    expect(container.firstChild).toBeDefined();
  });
});
