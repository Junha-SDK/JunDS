import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressBar, ProgressSteps } from "../../composites/Progress";

describe("ProgressBar", () => {
  it("renders with correct width", () => {
    const { container } = render(<ProgressBar value={50} />);
    const bar = container.querySelector("[role='progressbar']");
    expect(bar).toHaveStyle({ width: "50%" });
  });

  it("shows label", () => {
    render(<ProgressBar value={75} showLabel />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("shows custom label", () => {
    render(<ProgressBar value={60} label="진행률" showLabel />);
    expect(screen.getByText("진행률")).toBeInTheDocument();
  });

  it("clamps at 100%", () => {
    const { container } = render(<ProgressBar value={150} />);
    const bar = container.querySelector("[role='progressbar']");
    expect(bar).toHaveStyle({ width: "100%" });
  });

  it("applies variant color", () => {
    const { container } = render(<ProgressBar value={50} variant="danger" />);
    const bar = container.querySelector("[role='progressbar']");
    expect(bar).toHaveClass("bg-danger");
  });
});

describe("ProgressSteps", () => {
  it("renders correct number of steps", () => {
    render(<ProgressSteps current={2} total={4} />);
    // step 1 is completed (shows checkmark), step 2 is current, 3 and 4 are pending
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders labels", () => {
    render(<ProgressSteps current={2} total={3} labels={["A", "B", "C"]} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });
});
