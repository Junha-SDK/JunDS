import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Group } from "@/ds/core/Group";

describe("Group", () => {
  it("renders a wrapping row by default", () => {
    const { container } = render(<Group>x</Group>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("row");
    expect(el.style.flexWrap).toBe("wrap");
  });

  it("noWrap disables wrapping", () => {
    const { container } = render(<Group noWrap>x</Group>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.flexWrap).toBe("nowrap");
  });

  it("defaults gap to sm (8px) and align to center", () => {
    const { container } = render(<Group>x</Group>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gap).toBe("8px");
    expect(el.style.alignItems).toBe("center");
  });
});
