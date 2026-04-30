import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Image } from "../../primitives/Image";

describe("Image", () => {
  it("renders", () => {
    const { container } = render(<Image data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
