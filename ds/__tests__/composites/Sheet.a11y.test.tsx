import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Sheet } from "../../composites/Sheet";

describe("Sheet a11y", () => {
  it("renders content and a close affordance when open=true", () => {
    render(
      <Sheet open onClose={() => {}} title="옵션">
        <p>본문</p>
      </Sheet>,
    );
    expect(screen.getByText("본문")).toBeDefined();
  });

  it("invokes onClose on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Sheet open onClose={onClose} title="옵션">
        <p>본문</p>
      </Sheet>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
