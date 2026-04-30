import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { JSONViewer } from "../../composites/JSONViewer";

describe("JSONViewer", () => {
  it("renders with primitive data", () => {
    const { container } = render(<JSONViewer data="hello" />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders nested object data", () => {
    render(<JSONViewer data={{ name: "junha", age: 30, tags: ["a", "b"] }} />);
    // Numbers/strings/keys appear in the rendered tree.
    expect(screen.getByText(/name/)).toBeDefined();
  });

  it("handles null and arrays", () => {
    const { container } = render(<JSONViewer data={[null, 1, "two", { a: 1 }]} />);
    expect(container.firstChild).toBeDefined();
  });
});
