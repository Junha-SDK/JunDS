import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "../../composites/Modal";

describe("Modal", () => {
  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={() => {}}>
        내용
      </Modal>,
    );
    expect(screen.queryByText("내용")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    render(
      <Modal open onClose={() => {}}>
        내용
      </Modal>,
    );
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
    render(
      <Modal open onClose={onClose}>
        내용
      </Modal>,
    );
    // backdrop is the div with bg-black/40
    const backdrop =
      document.querySelector(".bg-black\\/30") ?? document.querySelector(".bg-black\\/40");
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on escape key", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        내용
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("has aria-modal", () => {
    render(
      <Modal open onClose={() => {}}>
        내용
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("renders all four members (Header/Title/Body/Footer)", () => {
    render(
      <Modal open onClose={() => {}}>
        <Modal.Header>제목</Modal.Header>
        <Modal.Body>본문</Modal.Body>
        <Modal.Footer>액션</Modal.Footer>
      </Modal>,
    );
    // Header 는 내부적으로 Title(<h3>) 을 렌더한다.
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("제목");
    expect(screen.getByText("본문")).toBeInTheDocument();
    expect(screen.getByText("액션")).toBeInTheDocument();
  });

  it("renders Modal.Title standalone for custom headers", () => {
    render(
      <Modal open onClose={() => {}}>
        <Modal.Title>커스텀 제목</Modal.Title>
      </Modal>,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("커스텀 제목");
  });

  it("members are position-independent and optional (Footer first, no Header)", () => {
    render(
      <Modal open onClose={() => {}}>
        <Modal.Footer>액션</Modal.Footer>
        <Modal.Body>본문</Modal.Body>
      </Modal>,
    );
    expect(screen.getByText("액션")).toBeInTheDocument();
    expect(screen.getByText("본문")).toBeInTheDocument();
  });

  it("delegates the content panel via asChild without an extra wrapper", () => {
    render(
      <Modal open onClose={() => {}} asChild>
        <section data-testid="panel">
          <Modal.Body>내용</Modal.Body>
        </section>
      </Modal>,
    );
    const panel = screen.getByTestId("panel");
    expect(panel.tagName).toBe("SECTION");
    // 패널 스타일(className)이 위임된 엘리먼트에 병합된다.
    expect(panel.className).toContain("bg-card");
    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("errors in dev when asChild is passed to a sub-member", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Modal open onClose={() => {}}>
        {/* @ts-expect-error — sub-member는 asChild를 받지 않는다 (런타임 가드 검증) */}
        <Modal.Header asChild>제목</Modal.Header>
      </Modal>,
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("[JunDS] sub-member에는 asChild를 사용할 수 없습니다"),
    );
    error.mockRestore();
  });
});
