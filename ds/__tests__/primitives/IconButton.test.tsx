import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { IconButton } from "../../primitives/IconButton";

describe("IconButton", () => {
  const icon = <svg data-testid="icon" />;

  it("renders with aria-label", () => {
    render(<IconButton icon={icon} label="닫기" />);
    expect(screen.getByLabelText("닫기")).toBeInTheDocument();
  });

  it("handles click", () => {
    const onClick = vi.fn();
    render(<IconButton icon={icon} label="클릭" onClick={onClick} />);
    fireEvent.click(screen.getByLabelText("클릭"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled", () => {
    render(<IconButton icon={icon} label="비활성" disabled />);
    expect(screen.getByLabelText("비활성")).toBeDisabled();
  });

  it("applies variant", () => {
    const { container } = render(<IconButton icon={icon} label="test" variant="filled" />);
    expect(container.firstChild).toHaveClass("bg-primary");
  });
});
