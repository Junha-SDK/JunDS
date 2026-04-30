import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Marquee } from "../../composites/Marquee";

describe("Marquee", () => {
  it("renders without throwing", () => {
    const { container } = render(<Marquee>{null}</Marquee>);
    expect(container.firstChild).toBeDefined();
  });
});
