import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { QRCode } from "../../composites/QRCode";

describe("QRCode", () => {
  it("renders without throwing", () => {
    const { container } = render(<QRCode value="" />);
    expect(container.firstChild).toBeDefined();
  });
});
