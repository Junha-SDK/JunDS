import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Spacer } from "../../layout/Spacer";

describe("Spacer", () => {
  it("renders without throwing", () => {
    const { container } = render(<Spacer />);
    expect(container.firstChild).toBeDefined();
  });
});
