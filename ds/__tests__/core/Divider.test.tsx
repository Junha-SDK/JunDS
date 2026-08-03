import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoreDivider } from "@/ds/core/Divider";

describe("CoreDivider", () => {
  it("renders an hr for the horizontal orientation", () => {
    const { container } = render(<CoreDivider />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("HR");
    expect(el.style.backgroundColor).toBe("var(--border)");
  });

  it("renders a vertical rule for orientation=vertical", () => {
    const { container } = render(<CoreDivider orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el.className).toContain("w-px");
  });

  it("renders a labeled separator with role", () => {
    render(<CoreDivider label="또는" />);
    const el = screen.getByRole("separator");
    expect(el).toHaveTextContent("또는");
  });

  it("applies a custom color token", () => {
    const { container } = render(<CoreDivider color="primary" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toBe("var(--primary)");
  });
});
