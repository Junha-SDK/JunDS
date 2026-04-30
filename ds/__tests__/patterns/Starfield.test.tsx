import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Starfield } from "../../patterns/Starfield";

describe("Starfield", () => {
  it("renders without throwing", () => {
    const { container } = render(<Starfield />);
    expect(container.firstChild).toBeDefined();
  });
});
