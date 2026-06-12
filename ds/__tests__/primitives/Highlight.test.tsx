import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Highlight } from "../../primitives/Highlight";

describe("Highlight", () => {
  it("renders without query", () => {
    const { container } = render(<Highlight text="JunDS" query="" />);
    expect(container.firstChild).toBeTruthy();
  });
  it("highlights match", () => {
    const { getByText } = render(<Highlight text="JunDS 디자인" query="디자인" variant="primary" />);
    expect(getByText("디자인")).toBeTruthy();
  });
});
