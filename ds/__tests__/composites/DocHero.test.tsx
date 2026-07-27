import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DocHero } from "../../composites/DocHero";

describe("DocHero", () => {
  it("renders without throwing", () => {
    const { container } = render(<DocHero title="" />);
    expect(container.firstChild).toBeDefined();
  });
});
