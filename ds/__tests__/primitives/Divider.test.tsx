import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Divider } from "../../primitives/Divider";

describe("Divider", () => {
  it("renders horizontal by default", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toHaveAttribute("role", "separator");
    expect(container.firstChild).toHaveClass("h-px");
  });

  it("renders with label", () => {
    render(<Divider label="또는" />);
    expect(screen.getByText("또는")).toBeInTheDocument();
  });

  it("renders vertical", () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.firstChild).toHaveClass("w-px");
  });
});
