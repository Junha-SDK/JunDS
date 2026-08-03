import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AutoHideHeader } from "../../composites/AutoHideHeader";

describe("AutoHideHeader", () => {
  it("renders without throwing", () => {
    const { container } = render(<AutoHideHeader>{null}</AutoHideHeader>);
    expect(container.firstChild).toBeDefined();
  });

  it("asChild delegates the root to the child element", () => {
    const { container } = render(
      <AutoHideHeader asChild className="extra">
        <a href="#" className="child">
          y
        </a>
      </AutoHideHeader>,
    );
    const root = container.firstChild as HTMLElement;
    // 기본 <header> 래퍼 없이 자식 <a>가 그대로 root 가 된다
    expect(root.tagName).toBe("A");
    expect(container.querySelector("header")).toBeNull();
    // className 병합 (slot 스타일 + child)
    expect(root).toHaveClass("sticky");
    expect(root).toHaveClass("extra");
    expect(root).toHaveClass("child");
  });
});
