import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GridLayout } from "@/ds/core/GridLayout";

describe("GridLayout", () => {
  it("renders a grid with 1 column and md gap by default", () => {
    const { container } = render(<GridLayout>x</GridLayout>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("grid");
    expect(el.style.gridTemplateColumns).toBe("repeat(1, 1fr)");
    expect(el.style.gap).toBe("16px");
  });

  it("numeric cols expands to repeat()", () => {
    const { container } = render(<GridLayout cols={3}>x</GridLayout>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  it("string cols passes through as a template", () => {
    const { container } = render(<GridLayout cols="200px 1fr">x</GridLayout>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe("200px 1fr");
  });
});
