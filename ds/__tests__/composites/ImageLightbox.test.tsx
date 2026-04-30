import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImageLightbox } from "../../composites/ImageLightbox";

describe("ImageLightbox", () => {
  it("renders without throwing", () => {
    const { container } = render(<ImageLightbox src="" />);
    expect(container.firstChild).toBeDefined();
  });
});
