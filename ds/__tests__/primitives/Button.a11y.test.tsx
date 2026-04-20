import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "../../primitives/Button";

describe("Button a11y", () => {
  it("renders as a button element", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
  });

  it("has disabled attribute when disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  });

  it("has focus-visible styles", () => {
    render(<Button>Focus me</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("focus-visible");
  });

  it("shows loading state accessibly", () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveProperty("disabled", true);
  });
});
