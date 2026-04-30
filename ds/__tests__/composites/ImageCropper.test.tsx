import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImageCropper } from "../../composites/ImageCropper";

describe("ImageCropper", () => {
  it("renders without throwing", () => {
    const { container } = render(<ImageCropper src="" />);
    expect(container.firstChild).toBeDefined();
  });
});
