import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThinkingIndicator } from "../../composites/ThinkingIndicator";

describe("ThinkingIndicator", () => {
  it("renders", () => {
    const { container } = render(<ThinkingIndicator data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
