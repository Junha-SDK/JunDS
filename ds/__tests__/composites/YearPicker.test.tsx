import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { YearPicker } from "../../composites/YearPicker";

describe("YearPicker", () => {
  it("renders", () => {
    const { container } = render(<YearPicker data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <YearPicker asChild className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </YearPicker>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("inline-block");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
