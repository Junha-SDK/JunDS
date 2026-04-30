import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Mark } from "../../primitives/Mark";

describe("Mark", () => {
  it("renders", () => {
    const { container } = render(<Mark data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
