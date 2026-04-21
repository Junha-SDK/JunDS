import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusDot } from "../../primitives/StatusDot";

describe("StatusDot", () => {
  it("renders label", () => {
    render(<StatusDot status="success" label="온라인" />);
    expect(screen.getByText("온라인")).toBeInTheDocument();
  });

  it("applies status color", () => {
    const { container } = render(<StatusDot status="danger" />);
    expect(container.querySelector(".bg-danger")).toBeInTheDocument();
  });

  it("renders without label", () => {
    const { container } = render(<StatusDot status="neutral" />);
    expect(container.querySelector(".rounded-full")).toBeInTheDocument();
  });
});
