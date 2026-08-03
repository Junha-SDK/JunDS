import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Affix } from "../../composites/Affix";

describe("Affix", () => {
  it("renders without throwing", () => {
    const { container } = render(<Affix>{null}</Affix>);
    expect(container.firstChild).toBeDefined();
  });

  it("asChild delegates the root to the child element", () => {
    const { container } = render(
      <Affix asChild className="extra">
        <a href="#" className="child">
          y
        </a>
      </Affix>,
    );
    const root = container.firstChild as HTMLElement;
    // 래퍼 div 없이 자식 <a>가 그대로 root 가 된다
    expect(root.tagName).toBe("A");
    expect(container.querySelector("div")).toBeNull();
    // className 병합 (slot + child)
    expect(root).toHaveClass("extra");
    expect(root).toHaveClass("child");
  });
});
