import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Wrap } from "../../layout/Wrap";

describe("Wrap", () => {
  it("renders without throwing", () => {
    const { container } = render(<Wrap />);
    expect(container.firstChild).toBeDefined();
  });
});
