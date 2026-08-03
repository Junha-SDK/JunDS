import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tag } from "../../primitives/Tag";

describe("Tag", () => {
  it("renders children", () => {
    render(<Tag>프론트엔드</Tag>);
    expect(screen.getByText("프론트엔드")).toBeInTheDocument();
  });

  it("applies color class", () => {
    const { container } = render(<Tag color="blue">Blue</Tag>);
    expect(container.firstChild).toHaveClass("bg-blue-50");
  });

  it("renders close button when closable", () => {
    const onClose = vi.fn();
    render(
      <Tag closable onClose={onClose}>
        삭제 가능
      </Tag>,
    );
    fireEvent.click(screen.getByLabelText("삭제"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not render close button by default", () => {
    render(<Tag>일반</Tag>);
    expect(screen.queryByLabelText("삭제")).not.toBeInTheDocument();
  });
});
