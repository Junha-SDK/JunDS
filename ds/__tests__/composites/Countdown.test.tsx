import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Countdown } from "../../composites/Countdown";

describe("Countdown", () => {
  it("renders", () => {
    const { container } = render(<Countdown to="2099-12-31T00:00:00Z" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
