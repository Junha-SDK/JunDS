import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "../../composites/Skeleton";

describe("Skeleton", () => {
  it("renders text lines", () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const lines = container.querySelectorAll(".animate-pulse");
    expect(lines.length).toBe(3);
  });

  it("renders circle", () => {
    const { container } = render(<Skeleton variant="circle" width={48} height={48} />);
    expect(container.firstChild).toHaveClass("rounded-full");
    expect(container.firstChild).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("renders rect", () => {
    const { container } = render(<Skeleton variant="rect" height={100} />);
    expect(container.firstChild).toHaveClass("rounded-lg");
    expect(container.firstChild).toHaveStyle({ height: "100px" });
  });

  it("last text line is shorter", () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const lines = container.querySelectorAll(".animate-pulse");
    expect(lines[2]).toHaveStyle({ width: "75%" });
  });
});
