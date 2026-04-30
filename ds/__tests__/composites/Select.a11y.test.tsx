import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Select } from "../../composites/Select";

const options = [
  { value: "kr", label: "한국" },
  { value: "us", label: "미국" },
];

describe("Select a11y", () => {
  it("renders a button as the trigger", () => {
    render(<Select options={options} placeholder="선택" />);
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("opens listbox on click and exposes role=option", async () => {
    const user = userEvent.setup();
    render(<Select options={options} placeholder="선택" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeDefined();
    expect(screen.getAllByRole("option").length).toBe(options.length);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Select options={options} placeholder="선택" />);
    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("listbox")).not.toBeNull();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("marks the currently selected option with aria-selected", async () => {
    const user = userEvent.setup();
    render(<Select options={options} value="us" placeholder="선택" />);
    await user.click(screen.getByRole("button"));
    const selected = screen
      .getAllByRole("option")
      .find((el) => el.getAttribute("aria-selected") === "true");
    expect(selected?.textContent).toContain("미국");
  });
});
