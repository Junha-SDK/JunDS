import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tabs } from "../../composites/Tabs";

const tabs = [
  { value: "all", label: "전체", badge: 42 },
  { value: "mine", label: "내 업무" },
  { value: "done", label: "완료" },
];

describe("Tabs", () => {
  it("renders all tabs", () => {
    render(<Tabs tabs={tabs} value="all" onChange={() => {}} />);
    expect(screen.getByText("전체")).toBeInTheDocument();
    expect(screen.getByText("내 업무")).toBeInTheDocument();
    expect(screen.getByText("완료")).toBeInTheDocument();
  });

  it("shows badge", () => {
    render(<Tabs tabs={tabs} value="all" onChange={() => {}} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("calls onChange on click", () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByText("내 업무"));
    expect(onChange).toHaveBeenCalledWith("mine");
  });

  it("marks active tab", () => {
    render(<Tabs tabs={tabs} value="all" onChange={() => {}} />);
    expect(screen.getByText("전체").closest("button")).toHaveAttribute("aria-selected", "true");
  });

  it("renders pills variant", () => {
    render(<Tabs tabs={tabs} value="all" onChange={() => {}} variant="pills" />);
    expect(screen.getByText("전체").closest("button")).toHaveClass("rounded-full");
  });

  it("renders segment variant", () => {
    const { container } = render(
      <Tabs tabs={tabs} value="all" onChange={() => {}} variant="segment" />,
    );
    expect(container.firstChild).toHaveClass("bg-border-light");
  });
});
