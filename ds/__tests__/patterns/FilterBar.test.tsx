import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilterBar } from "../../patterns/FilterBar";

describe("FilterBar", () => {
  it("renders search input", () => {
    render(<FilterBar searchValue="" onSearchChange={() => {}} searchPlaceholder="검색..." />);
    expect(screen.getByPlaceholderText("검색...")).toBeInTheDocument();
  });

  it("calls onSearchChange", () => {
    const onChange = vi.fn();
    render(<FilterBar searchValue="" onSearchChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("검색..."), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("shows reset button with activeCount", () => {
    render(<FilterBar onReset={() => {}} activeCount={2} />);
    expect(screen.getByText("초기화")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("hides reset when no active filters", () => {
    render(<FilterBar onReset={() => {}} activeCount={0} />);
    expect(screen.queryByText("초기화")).not.toBeInTheDocument();
  });

  it("renders actions", () => {
    render(<FilterBar actions={<button>내보내기</button>} />);
    expect(screen.getByText("내보내기")).toBeInTheDocument();
  });
});
