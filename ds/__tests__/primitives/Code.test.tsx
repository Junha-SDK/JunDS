import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Code } from "../../primitives/Code";

describe("Code", () => {
  it("renders", () => {
    const { container } = render(<Code data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
