import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RadioCardGroup } from "../../composites/RadioCardGroup";

describe("RadioCardGroup", () => {
  it("renders", () => {
    const { container } = render(
      <RadioCardGroup options={[{ value: "a", title: "A" }]} data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <RadioCardGroup asChild options={[{ value: "a", title: "A" }]} className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </RadioCardGroup>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("grid");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
