import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Combobox } from "../../composites/Combobox";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

describe("Combobox a11y", () => {
  it("renders an input as the trigger", () => {
    render(<Combobox options={options} placeholder="검색" />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("filters options on input", async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} placeholder="검색" />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.type(input, "react");
    // After typing "react", "Vue" and "Svelte" should not be in the listbox
    expect(screen.queryByText("Vue")).toBeNull();
    expect(screen.queryByText("Svelte")).toBeNull();
    expect(screen.getByText("React")).toBeDefined();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} placeholder="검색" />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{Escape}");
    // After escape, panel should be closed (no listbox visible)
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
