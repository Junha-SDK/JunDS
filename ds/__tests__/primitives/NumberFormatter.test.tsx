import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NumberFormatter } from "../../primitives/NumberFormatter";

describe("NumberFormatter", () => {
  it("renders without throwing", () => {
    const { container } = render(<NumberFormatter value={0} />);
    expect(container.firstChild).toBeDefined();
  });
});
