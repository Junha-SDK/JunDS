import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "../../primitives/Badge";

describe("Badge", () => {
  it("renders with text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeDefined();
  });

  it("renders all variants", () => {
    const variants = ["primary", "success", "danger", "warning", "info", "default"] as const;
    variants.forEach((variant) => {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toBeDefined();
      unmount();
    });
  });

  it("renders different sizes", () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText("Small")).toBeDefined();
    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText("Large")).toBeDefined();
  });
});
