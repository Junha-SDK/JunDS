import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Confetti } from "../../composites/Confetti";

describe("Confetti", () => {
  it("renders without throwing", () => {
    const { container } = render(<Confetti active={false} />);
    expect(container.firstChild).toBeDefined();
  });
});
