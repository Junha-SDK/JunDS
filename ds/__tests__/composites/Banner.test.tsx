import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Banner } from "../../composites/Banner";

describe("Banner", () => {
  it("renders without throwing", () => {
    const { container } = render(<Banner>{null}</Banner>);
    expect(container.firstChild).toBeDefined();
  });
});
