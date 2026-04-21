import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Input } from "../../primitives/Input";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeDefined();
  });

  it("handles onChange", async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders disabled state", () => {
    render(<Input disabled placeholder="disabled" />);
    expect(screen.getByPlaceholderText("disabled")).toHaveProperty("disabled", true);
  });

  it("renders different sizes", () => {
    const { rerender } = render(<Input inputSize="sm" placeholder="sm" />);
    expect(screen.getByPlaceholderText("sm")).toBeDefined();
    rerender(<Input inputSize="lg" placeholder="lg" />);
    expect(screen.getByPlaceholderText("lg")).toBeDefined();
  });
});
