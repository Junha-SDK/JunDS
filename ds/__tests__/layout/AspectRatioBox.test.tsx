import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AspectRatioBox } from "../../layout/AspectRatioBox";

describe("AspectRatioBox", () => {
  it("renders without throwing", () => {
    const { container } = render(<AspectRatioBox>{null}</AspectRatioBox>);
    expect(container.firstChild).toBeDefined();
  });
});
