import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Carousel } from "../../composites/Carousel";

describe("Carousel", () => {
  it("renders without throwing", () => {
    const { container } = render(<Carousel>{null}{null}</Carousel>);
    expect(container.firstChild).toBeDefined();
  });
});
