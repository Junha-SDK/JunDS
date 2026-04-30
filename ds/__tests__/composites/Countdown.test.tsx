import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Countdown } from "../../composites/Countdown";

describe("Countdown", () => {
  it("renders", () => {
    const { container } = render(<Countdown data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
