import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Kbd } from "../../primitives/Kbd";

describe("Kbd", () => {
  it("renders keys joined", () => {
    render(<Kbd keys={["⌘", "K"]} />);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("renders children when no keys", () => {
    render(<Kbd>Esc</Kbd>);
    expect(screen.getByText("Esc")).toBeInTheDocument();
  });
});
