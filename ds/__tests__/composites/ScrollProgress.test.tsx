import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScrollProgress } from "../../composites/ScrollProgress";

describe("ScrollProgress", () => {
  it("renders", () => {
    const { container } = render(<ScrollProgress data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
