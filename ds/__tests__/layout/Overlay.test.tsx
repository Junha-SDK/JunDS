import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Overlay } from "../../layout/Overlay";

describe("Overlay", () => {
  it("renders without throwing", () => {
    const { container } = render(<Overlay>{null}</Overlay>);
    expect(container.firstChild).toBeDefined();
  });
});
