import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "../../composites/Modal";

describe("Modal", () => {
  it("does not render when closed", () => {
    render(<Modal open={false} onClose={() => {}}>내용</Modal>);
    expect(screen.queryByText("내용")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    render(<Modal open onClose={() => {}}>내용</Modal>);
    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("renders with header and footer", () => {
    render(
      <Modal open onClose={() => {}}>
        <Modal.Header>제목</Modal.Header>
        <div>본문</div>
        <Modal.Footer>액션</Modal.Footer>
      </Modal>,
    );
    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("본문")).toBeInTheDocument();
    expect(screen.getByText("액션")).toBeInTheDocument();
  });

  it("calls onClose on backdrop click", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>내용</Modal>);
    // backdrop is the div with bg-black/40
    const backdrop = document.querySelector(".bg-black\\/30") ?? document.querySelector(".bg-black\\/40");
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on escape key", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>내용</Modal>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("has aria-modal", () => {
    render(<Modal open onClose={() => {}}>내용</Modal>);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });
});
