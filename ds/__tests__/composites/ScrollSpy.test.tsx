import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScrollSpy } from "../../composites/ScrollSpy";

describe("ScrollSpy", () => {
  it("renders without throwing", () => {
    const { container } = render(<ScrollSpy sections={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
