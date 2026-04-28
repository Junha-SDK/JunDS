import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Alert } from "../../composites/Alert";

describe("Alert", () => {
  it("renders message", () => {
    render(<Alert>테스트 메시지</Alert>);
    expect(screen.getByText("테스트 메시지")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<Alert title="주의">내용</Alert>);
    expect(screen.getByText("주의")).toBeInTheDocument();
  });

  it("applies variant styles", () => {
    const { container } = render(<Alert variant="danger">위험</Alert>);
    expect(container.firstChild).toHaveClass("border-l-danger");
  });

  it("has alert role", () => {
    render(<Alert>알림</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("calls onClose", () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>닫기 가능</Alert>);
    fireEvent.click(screen.getByRole("alert").querySelector("button")!);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
