import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SpoilerBlock } from "../../composites/SpoilerBlock";

describe("SpoilerBlock", () => {
  it("renders without throwing", () => {
    const { container } = render(<SpoilerBlock>{null}</SpoilerBlock>);
    expect(container.firstChild).toBeDefined();
  });
});
