import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Textarea } from "../../primitives/Textarea";

describe("Textarea", () => {
  it("renders without throwing", () => {
    const { container } = render(<Textarea />);
    expect(container.firstChild).toBeDefined();
  });
});
