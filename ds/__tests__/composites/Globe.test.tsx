import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Globe } from "../../composites/Globe";

describe("Globe", () => {
  it("renders without throwing", () => {
    const { container } = render(<Globe />);
    expect(container.firstChild).toBeDefined();
  });
});
