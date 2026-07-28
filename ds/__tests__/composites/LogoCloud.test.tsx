import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LogoCloud } from "../../composites/LogoCloud";

describe("LogoCloud", () => {
  it("renders", () => {
    const { container } = render(<LogoCloud logos={[{ name: "Acme" }]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
