import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HeroSection } from "../../patterns/HeroSection";

describe("HeroSection", () => {
  it("renders", () => {
    const { container } = render(<HeroSection title="x" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
