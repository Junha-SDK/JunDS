import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SignaturePad } from "../../composites/SignaturePad";

describe("SignaturePad", () => {
  it("renders without throwing", () => {
    const { container } = render(<SignaturePad />);
    expect(container.firstChild).toBeDefined();
  });
});
