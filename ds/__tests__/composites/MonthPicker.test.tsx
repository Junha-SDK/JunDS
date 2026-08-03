import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MonthPicker } from "../../composites/MonthPicker";

describe("MonthPicker", () => {
  it("renders", () => {
    const { container } = render(<MonthPicker data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <MonthPicker asChild className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </MonthPicker>,
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
