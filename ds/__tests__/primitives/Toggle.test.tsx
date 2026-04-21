import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Toggle } from "../../primitives/Toggle";

describe("Toggle", () => {
  it("renders unchecked", () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDefined();
  });

  it("calls onChange on click", async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders with label", () => {
    render(<Toggle checked={false} onChange={() => {}} label="Dark mode" />);
    expect(screen.getByText("Dark mode")).toBeDefined();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Toggle checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole("switch")).toHaveProperty("disabled", true);
  });
});
