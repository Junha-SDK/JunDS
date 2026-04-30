import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { DsToastProvider, useDsToast } from "../../composites/Toast";

function Trigger() {
  const toast = useDsToast();
  return (
    <button type="button" onClick={() => toast.success("저장되었습니다")}>show</button>
  );
}

describe("Toast a11y", () => {
  it("emitted toast is announced via role=alert", async () => {
    const user = userEvent.setup();
    render(
      <DsToastProvider>
        <Trigger />
      </DsToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "show" }));
    const alerts = await screen.findAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].textContent).toContain("저장되었습니다");
  });

  it("toast region announces politely (aria-live=polite)", async () => {
    const user = userEvent.setup();
    render(
      <DsToastProvider>
        <Trigger />
      </DsToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "show" }));
    await act(async () => {});
    // Toast renders into a portal so the live region is on document, not container.
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
  });
});
