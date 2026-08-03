import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ButtonGroup } from "../../composites/ButtonGroup";

describe("ButtonGroup", () => {
  it("renders children", () => {
    render(
      <ButtonGroup>
        <button>A</button>
        <button>B</button>
      </ButtonGroup>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("has group role", () => {
    render(
      <ButtonGroup>
        <button>A</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("applies fullWidth", () => {
    const { container } = render(
      <ButtonGroup fullWidth>
        <button>A</button>
      </ButtonGroup>,
    );
    expect(container.firstChild).toHaveClass("w-full");
  });

  it("asChild delegates the root to the child element", () => {
    const { container } = render(
      <ButtonGroup asChild className="extra">
        <a href="#" className="child">
          y
        </a>
      </ButtonGroup>,
    );
    const root = container.firstChild as HTMLElement;
    // 래퍼 div 없이 자식 <a>가 그대로 root 가 된다
    expect(root.tagName).toBe("A");
    expect(container.querySelector("div")).toBeNull();
    // className 병합 (slot 스타일 + child) + role 전달
    expect(root).toHaveClass("inline-flex");
    expect(root).toHaveClass("extra");
    expect(root).toHaveClass("child");
    expect(root).toHaveAttribute("role", "group");
  });
});
