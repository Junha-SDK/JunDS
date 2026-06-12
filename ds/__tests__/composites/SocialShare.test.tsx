import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SocialShare } from "../../composites/SocialShare";

describe("SocialShare", () => {
  it("renders", () => {
    const { container } = render(<SocialShare url="https://x.com" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
