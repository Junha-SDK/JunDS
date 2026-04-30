import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CopyButton } from "../../primitives/CopyButton";

describe("CopyButton", () => {
  it("renders without throwing", () => {
    const { container } = render(<CopyButton text="" />);
    expect(container.firstChild).toBeDefined();
  });
});
