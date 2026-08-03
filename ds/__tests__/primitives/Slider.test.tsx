import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Slider } from "../../primitives/Slider";

describe("Slider", () => {
  it("renders with role slider", () => {
    render(<Slider value={50} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("has correct aria values", () => {
    render(<Slider value={30} min={0} max={100} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "30");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
  });

  it("shows value when showValue", () => {
    render(<Slider value={75} showValue />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("shows min/max when showValue", () => {
    render(<Slider value={50} min={0} max={200} showValue />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("renders marks", () => {
    render(
      <Slider
        value={50}
        marks={[
          { value: 0, label: "시작" },
          { value: 100, label: "끝" },
        ]}
      />,
    );
    expect(screen.getByText("시작")).toBeInTheDocument();
    expect(screen.getByText("끝")).toBeInTheDocument();
  });

  it("applies disabled opacity", () => {
    const { container } = render(<Slider value={50} disabled />);
    expect(container.firstChild).toHaveClass("opacity-50");
  });
});
