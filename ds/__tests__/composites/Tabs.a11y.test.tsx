import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Tabs } from "../../composites/Tabs";

const tabs = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
];

describe("Tabs a11y", () => {
  it("renders a tablist with role=tab buttons", () => {
    render(<Tabs tabs={tabs} value="a" onChange={() => {}} variant="segment" />);
    expect(screen.getByRole("tablist")).toBeDefined();
    expect(screen.getAllByRole("tab").length).toBe(tabs.length);
  });

  it("marks the selected tab with aria-selected=true", () => {
    render(<Tabs tabs={tabs} value="b" onChange={() => {}} variant="segment" />);
    const selected = screen
      .getAllByRole("tab")
      .find((el) => el.getAttribute("aria-selected") === "true");
    expect(selected?.textContent).toBe("B");
  });

  it("invokes onChange when a tab is clicked", async () => {
    const user = userEvent.setup();
    let clicked = "";
    render(<Tabs tabs={tabs} value="a" onChange={(v) => (clicked = v)} variant="segment" />);
    await user.click(screen.getByRole("tab", { name: "C" }));
    expect(clicked).toBe("c");
  });
});
