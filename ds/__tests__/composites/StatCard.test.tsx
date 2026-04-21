import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatCard } from "../../composites/StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="총 업무" value={142} />);
    expect(screen.getByText("총 업무")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
  });

  it("renders change with trend", () => {
    render(<StatCard label="완료" value={98} change="+12%" trend="up" />);
    expect(screen.getByText(/\+12%/)).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<StatCard label="X" value={1} description="지난 주 대비" />);
    expect(screen.getByText("지난 주 대비")).toBeInTheDocument();
  });
});
