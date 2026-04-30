import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Dock } from "../../composites/Dock";

describe("Dock", () => {
  it("renders without throwing", () => {
    const { container } = render(<Dock>{null}</Dock>);
    expect(container.firstChild).toBeDefined();
  });
});
