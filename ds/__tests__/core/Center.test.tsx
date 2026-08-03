import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Center } from "@/ds/core/Center";

describe("Center", () => {
  it("centers children on both axes with flex", () => {
    const { container } = render(<Center>x</Center>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("flex");
    expect(el.style.alignItems).toBe("center");
    expect(el.style.justifyContent).toBe("center");
  });

  it("forwards other Box style props", () => {
    const { container } = render(<Center p={4}>x</Center>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.padding).toBe("16px");
  });
});
