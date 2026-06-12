import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImageZoom } from "../../composites/ImageZoom";

describe("ImageZoom", () => {
  it("renders", () => {
    const { container } = render(<ImageZoom src="/a.jpg" alt="작품" />);
    expect(container.firstChild).toBeTruthy();
  });
});
