import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Callout } from "../../composites/Callout";

describe("Callout", () => {
  it("renders without throwing", () => {
    const { container } = render(<Callout>{null}</Callout>);
    expect(container.firstChild).toBeDefined();
  });
});
