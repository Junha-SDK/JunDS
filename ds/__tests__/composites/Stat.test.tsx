import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stat } from "../../composites/Stat";

describe("Stat", () => {
  it("renders", () => {
    const { container } = render(<Stat label="x" value="1" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
