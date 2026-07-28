import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Drawer } from "../../composites/Drawer";

describe("Drawer a11y", () => {
  it("has role=dialog and aria-modal", () => {
    render(
      <Drawer open onClose={vi.fn()} title="Test Drawer">
        <div>Content</div>
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("has aria-label from title", () => {
    render(
      <Drawer open onClose={vi.fn()} title="Filter Panel">
        <div>Content</div>
      </Drawer>,
    );
    expect(screen.getByRole("dialog").getAttribute("aria-label")).toBe("Filter Panel");
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Drawer">
        <div>Content</div>
      </Drawer>,
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
