import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NumberInput } from "../../primitives/NumberInput";

describe("NumberInput a11y", () => {
  it("decrement button has aria-label", () => {
    render(<NumberInput value={5} onChange={vi.fn()} />);
    expect(screen.getByLabelText("감소")).toBeDefined();
  });

  it("increment button has aria-label", () => {
    render(<NumberInput value={5} onChange={vi.fn()} />);
    expect(screen.getByLabelText("증가")).toBeDefined();
  });

  it("input has type=number", () => {
    render(<NumberInput value={5} onChange={vi.fn()} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toBeDefined();
  });
});
