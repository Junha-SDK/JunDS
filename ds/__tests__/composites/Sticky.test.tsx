import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Sticky } from "../../composites/Sticky";

describe("Sticky", () => {
  it("renders without throwing", () => {
    const { container } = render(<Sticky>{null}</Sticky>);
    expect(container.firstChild).toBeDefined();
  });
});
