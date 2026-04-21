import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Drawer } from "../../composites/Drawer";

describe("Drawer", () => {
  it("renders content when open", () => {
    render(<Drawer open onClose={() => {}} title="필터">내용</Drawer>);
    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<Drawer open onClose={() => {}} title="설정">본문</Drawer>);
    expect(screen.getByText("설정")).toBeInTheDocument();
  });

  it("calls onClose on escape", () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose} title="Test">내용</Drawer>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders footer", () => {
    render(<Drawer open onClose={() => {}} footer={<button>저장</button>}>내용</Drawer>);
    expect(screen.getByText("저장")).toBeInTheDocument();
  });
});
