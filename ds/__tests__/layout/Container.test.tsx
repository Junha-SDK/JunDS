import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Container } from "../../layout/Container";

describe("Container", () => {
  it("renders without throwing", () => {
    const { container } = render(<Container />);
    expect(container.firstChild).toBeDefined();
  });
});
