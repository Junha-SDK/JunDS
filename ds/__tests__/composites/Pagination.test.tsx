import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Pagination } from "../../composites/Pagination";

describe("Pagination", () => {
  it("renders page buttons", () => {
    render(<Pagination page={1} totalPages={5} onChange={() => {}} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onChange on page click", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onChange={onChange} />);
    fireEvent.click(screen.getByText("2")); // adjacent to page 1
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("highlights current page", () => {
    render(<Pagination page={3} totalPages={5} onChange={() => {}} />);
    expect(screen.getByText("3").closest("button")).toHaveClass("bg-primary");
  });

  it("disables prev on first page", () => {
    const { container } = render(<Pagination page={1} totalPages={5} onChange={() => {}} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("disables next on last page", () => {
    const { container } = render(<Pagination page={5} totalPages={5} onChange={() => {}} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it("returns null for single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows ellipsis for many pages", () => {
    render(<Pagination page={10} totalPages={20} onChange={() => {}} />);
    expect(screen.getAllByText("...").length).toBeGreaterThan(0);
  });
});
