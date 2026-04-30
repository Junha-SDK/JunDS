import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Clock } from "../../composites/Clock";

describe("Clock", () => {
  it("renders", () => {
    const { container } = render(<Clock data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
