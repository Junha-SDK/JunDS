import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../../primitives/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>저장</Button>);
    expect(screen.getByText("저장")).toBeInTheDocument();
  });

  it("defaults to a non-submitting button", () => {
    render(<Button>열기</Button>);
    expect(screen.getByRole("button", { name: "열기" })).toHaveAttribute("type", "button");
  });

  it("allows an explicit submit type", () => {
    render(<Button type="submit">저장</Button>);
    expect(screen.getByRole("button", { name: "저장" })).toHaveAttribute("type", "submit");
  });

  it("applies variant classes", () => {
    const { container } = render(<Button variant="danger">삭제</Button>);
    expect(container.firstChild).toHaveClass("bg-danger");
  });

  it("applies size classes", () => {
    const { container } = render(<Button size="lg">큰 버튼</Button>);
    expect(container.firstChild).toHaveClass("h-11");
  });

  it("handles click", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByText("클릭"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>비활성</Button>);
    expect(screen.getByText("비활성")).toBeDisabled();
  });

  it("is disabled when loading", () => {
    render(<Button loading>로딩</Button>);
    expect(screen.getByText("로딩").closest("button")).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    render(<Button loading>로딩</Button>);
    expect(screen.getByText("로딩").closest("button")?.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it("renders leftIcon", () => {
    render(<Button leftIcon={<span data-testid="icon">+</span>}>추가</Button>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies fullWidth class", () => {
    const { container } = render(<Button fullWidth>전체</Button>);
    expect(container.firstChild).toHaveClass("w-full");
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>ref</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it("exposes a loading link as disabled when using asChild", () => {
    render(
      <Button asChild loading>
        <a href="/next">다음</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "다음" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(link).toHaveClass("pointer-events-none");
  });
});
