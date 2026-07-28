import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConfirmDialog } from "../../composites/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders title and description", () => {
    render(
      <ConfirmDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        title="삭제?"
        description="되돌릴 수 없습니다"
      />,
    );
    expect(screen.getByText("삭제?")).toBeInTheDocument();
    expect(screen.getByText("되돌릴 수 없습니다")).toBeInTheDocument();
  });

  it("calls onConfirm", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open onClose={() => {}} onConfirm={onConfirm} title="확인?" />);
    fireEvent.click(screen.getByText("확인"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onClose on cancel", () => {
    const onClose = vi.fn();
    render(<ConfirmDialog open onClose={onClose} onConfirm={() => {}} title="확인?" />);
    fireEvent.click(screen.getByText("취소"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows danger style", () => {
    render(
      <ConfirmDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        title="정말 삭제?"
        danger
        confirmLabel="삭제"
      />,
    );
    expect(screen.getByText("정말 삭제?")).toBeInTheDocument();
    expect(screen.getByText("삭제")).toBeInTheDocument();
  });
});
