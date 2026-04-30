import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AlertDialog } from "../../composites/AlertDialog";

describe("AlertDialog a11y", () => {
  it("renders as role=alertdialog with aria-modal when open", () => {
    render(
      <AlertDialog
        open
        onConfirm={() => {}}
        onCancel={() => {}}
        title="삭제 확인"
        description="정말 삭제하시겠습니까?"
      />,
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("hides when open=false", () => {
    render(
      <AlertDialog
        open={false}
        onConfirm={() => {}}
        onCancel={() => {}}
        title="삭제 확인"
        description="정말 삭제하시겠습니까?"
      />,
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("confirm and cancel buttons are reachable by accessible name", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <AlertDialog
        open
        onConfirm={onConfirm}
        onCancel={onCancel}
        title="삭제 확인"
        description="정말 삭제하시겠습니까?"
        confirmLabel="삭제"
        cancelLabel="취소"
      />,
    );
    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(onCancel).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "삭제" }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
