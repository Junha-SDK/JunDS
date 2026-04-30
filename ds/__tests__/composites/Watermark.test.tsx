import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Watermark } from "../../composites/Watermark";

describe("Watermark", () => {
  it("renders without throwing", () => {
    const { container } = render(<Watermark text="">{null}</Watermark>);
    expect(container.firstChild).toBeDefined();
  });
});
