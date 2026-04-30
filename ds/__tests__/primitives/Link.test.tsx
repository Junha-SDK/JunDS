import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Link } from "../../primitives/Link";

describe("Link", () => {
  it("renders", () => {
    const { container } = render(<Link data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
