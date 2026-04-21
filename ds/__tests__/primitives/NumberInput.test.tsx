import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NumberInput } from "../../primitives/NumberInput";

describe("NumberInput", () => {
  it("renders with value", () => {
    render(<NumberInput value={5} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(5);
  });

  it("increments on + click", () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]); // increment button
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it("decrements on - click", () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // decrement button
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("respects min", () => {
    const onChange = vi.fn();
    render(<NumberInput value={0} onChange={onChange} min={0} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("respects max", () => {
    const onChange = vi.fn();
    render(<NumberInput value={10} onChange={onChange} max={10} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toBeDisabled();
  });

  it("hides controls when hideControls", () => {
    render(<NumberInput value={5} hideControls />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
