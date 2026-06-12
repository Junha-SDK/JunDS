import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Hint } from "../../composites/Hint";

describe("Hint", () => {
  it("renders", () => {
    const { container } = render(<Hint data-testid="root">x</Hint>);
    expect(container.firstChild).toBeTruthy();
  });
});
