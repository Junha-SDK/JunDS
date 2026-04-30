import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CookieConsent } from "../../composites/CookieConsent";

describe("CookieConsent", () => {
  it("renders", () => {
    const { container } = render(<CookieConsent data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
