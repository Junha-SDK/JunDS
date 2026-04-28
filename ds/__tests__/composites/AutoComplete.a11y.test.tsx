import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AutoComplete } from "../../composites/AutoComplete";

const options = [
  { key: "1", label: "Apple" },
  { key: "2", label: "Banana" },
  { key: "3", label: "Cherry" },
];

describe("AutoComplete a11y", () => {
  it("has combobox role on input", () => {
    render(<AutoComplete value="" onChange={vi.fn()} options={options} />);
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("shows listbox on focus", async () => {
    render(<AutoComplete value="" onChange={vi.fn()} options={options} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("options have role=option", async () => {
    render(<AutoComplete value="" onChange={vi.fn()} options={options} />);
    await userEvent.click(screen.getByRole("combobox"));
    const opts = screen.getAllByRole("option");
    expect(opts.length).toBe(3);
  });

  it("keyboard navigation updates aria-activedescendant", async () => {
    render(<AutoComplete value="" onChange={vi.fn()} options={options} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
  });

  it("Escape closes dropdown", async () => {
    render(<AutoComplete value="" onChange={vi.fn()} options={options} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    expect(screen.getByRole("listbox")).toBeDefined();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
