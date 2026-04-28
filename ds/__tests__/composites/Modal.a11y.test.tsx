import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "../../composites/Modal";

describe("Modal a11y", () => {
  it("has correct ARIA attributes", () => {
    render(
      <Modal open onClose={vi.fn()}>
        <Modal.Header>Test Title</Modal.Header>
        <div>Content</div>
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <Modal.Header onClose={onClose}>Title</Modal.Header>
        <div>Content</div>
      </Modal>
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on backdrop click when dismissible", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose} dismissible>
        <div>Content</div>
      </Modal>
    );
    // Click the backdrop (first child of the portal - the overlay div)
    const backdrop = container.ownerDocument.querySelector(".fixed.inset-0 .absolute.inset-0");
    if (backdrop) await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not render when closed", () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <div>Hidden Content</div>
      </Modal>
    );
    expect(screen.queryByText("Hidden Content")).toBeNull();
  });
});
