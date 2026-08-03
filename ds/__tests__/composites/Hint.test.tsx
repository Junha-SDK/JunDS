import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Hint } from "../../composites/Hint";

describe("Hint", () => {
  it("renders", () => {
    const { container } = render(<Hint data-testid="root">x</Hint>);
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <Hint asChild className="extra-class">
        <a href="#">y</a>
      </Hint>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("inline-flex");
    expect(root?.className).toContain("extra-class");
    // 래퍼 div 가 생기지 않는다
    expect(container.querySelector("div")).toBeNull();
  });
});
