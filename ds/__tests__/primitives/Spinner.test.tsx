import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Spinner } from "../../primitives/Spinner";

describe("Spinner", () => {
  it("renders with default label", () => {
    render(<Spinner />);
    expect(screen.getByLabelText("로딩 중")).toBeInTheDocument();
  });

  it("applies color class", () => {
    const { container } = render(<Spinner color="muted" />);
    expect(container.firstChild).toHaveClass("text-muted");
  });

  it("renders at different sizes", () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "28");
  });
});
