import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Newsletter } from "../../composites/Newsletter";

describe("Newsletter", () => {
  it("renders", () => {
    const { container } = render(<Newsletter data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
