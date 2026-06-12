import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Motion } from "../../primitives/Motion";

describe("Motion", () => {
  it("renders", () => {
    const { container } = render(<Motion data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
