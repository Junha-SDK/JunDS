import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BottomSheet } from "../../composites/BottomSheet";

describe("BottomSheet a11y", () => {
  it("renders as role=dialog with aria-modal when open", () => {
    render(
      <BottomSheet open onClose={() => {}} title="설정">
        <p>본문</p>
      </BottomSheet>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("설정");
  });

  it("invokes onClose on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} title="설정">
        <p>본문</p>
      </BottomSheet>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
