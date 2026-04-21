import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Checkbox } from "../../primitives/Checkbox";

describe("Checkbox", () => {
  it("renders label", () => {
    render(<Checkbox label="동의합니다" />);
    expect(screen.getByText("동의합니다")).toBeInTheDocument();
  });

  it("handles change", () => {
    const onChange = vi.fn();
    render(<Checkbox label="체크" onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalled();
  });

  it("renders checked state", () => {
    render(<Checkbox checked onChange={() => {}} label="체크됨" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("is disabled", () => {
    render(<Checkbox disabled label="비활성" />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});
