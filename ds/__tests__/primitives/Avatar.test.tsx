import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Avatar } from "../../primitives/Avatar";

describe("Avatar", () => {
  it("renders initials from name", () => {
    render(<Avatar name="김준하" />);
    expect(screen.getByText("김준")).toBeInTheDocument();
  });

  it("renders ? when no name", () => {
    render(<Avatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("renders image when src", () => {
    render(<Avatar src="/photo.jpg" name="김준하" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/photo.jpg");
  });

  it("applies size class", () => {
    const { container } = render(<Avatar name="김준하" size="xl" />);
    expect(container.querySelector(".w-14")).toBeInTheDocument();
  });

  it("shows status dot", () => {
    const { container } = render(<Avatar name="김준하" status="online" />);
    expect(container.querySelector(".bg-green-500")).toBeInTheDocument();
  });

  it("shows busy status", () => {
    const { container } = render(<Avatar name="김준하" status="busy" />);
    expect(container.querySelector(".bg-red-500")).toBeInTheDocument();
  });
});
