import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Label } from "../../primitives/Label";

describe("Label", () => {
  it("renders text", () => {
    render(<Label>이름</Label>);
    expect(screen.getByText("이름")).toBeInTheDocument();
  });

  it("shows required indicator", () => {
    render(<Label required>이름</Label>);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders htmlFor", () => {
    render(<Label htmlFor="name-input">이름</Label>);
    expect(screen.getByText("이름")).toHaveAttribute("for", "name-input");
  });
});
