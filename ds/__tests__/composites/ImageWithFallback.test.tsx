import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImageWithFallback } from "../../composites/ImageWithFallback";

describe("ImageWithFallback", () => {
  it("renders", () => {
    const { container } = render(<ImageWithFallback src="/p.jpg" alt="사진" />);
    expect(container.firstChild).toBeTruthy();
  });
});
