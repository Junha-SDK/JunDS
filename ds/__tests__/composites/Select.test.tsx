import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Select } from "../../composites/Select";

const options = [
  { value: "a", label: "옵션 A" },
  { value: "b", label: "옵션 B" },
  { value: "c", label: "옵션 C" },
];

describe("Select", () => {
  it("renders placeholder", () => {
    render(<Select options={options} placeholder="선택하세요" />);
    expect(screen.getByText("선택하세요")).toBeInTheDocument();
  });

  it("opens dropdown on click", () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("selects option", () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("옵션 B"));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("shows selected value", () => {
    render(<Select options={options} value="a" />);
    expect(screen.getByText("옵션 A")).toBeInTheDocument();
  });

  it("is disabled", () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("filters options when searchable", () => {
    render(<Select options={options} searchable />);
    fireEvent.click(screen.getByRole("button"));
    const searchInput = screen.getByPlaceholderText("검색...");
    fireEvent.change(searchInput, { target: { value: "B" } });
    expect(screen.getByText("옵션 B")).toBeInTheDocument();
    expect(screen.queryByText("옵션 A")).not.toBeInTheDocument();
  });
});
