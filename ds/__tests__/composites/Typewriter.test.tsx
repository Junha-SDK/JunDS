import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Typewriter } from "../../composites/Typewriter";

describe("Typewriter", () => {
  it("renders without throwing", () => {
    const { container } = render(<Typewriter texts={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
