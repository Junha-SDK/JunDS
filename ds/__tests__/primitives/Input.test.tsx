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
    const { rerender } = render(<Input size="sm" placeholder="sm" />);
    expect(screen.getByPlaceholderText("sm")).toBeDefined();
    rerender(<Input size="lg" placeholder="lg" />);
    expect(screen.getByPlaceholderText("lg")).toBeDefined();
  });

  it("exposes the error state to assistive technology", () => {
    render(<Input error aria-label="이메일" />);
    expect(screen.getByLabelText("이메일")).toHaveAttribute("aria-invalid", "true");
  });

  it("keeps input and wrapper customization separate when using slots", () => {
    const { container } = render(
      <Input
        aria-label="검색"
        leftSlot={<svg data-testid="search-icon" />}
        className="text-right"
        wrapperClassName="max-w-sm"
      />,
    );
    expect(container.firstChild).toHaveClass("max-w-sm");
    expect(screen.getByLabelText("검색")).toHaveClass("text-right");
    expect(screen.getByTestId("search-icon").parentElement).toHaveAttribute("data-slot", "left");
  });
});
