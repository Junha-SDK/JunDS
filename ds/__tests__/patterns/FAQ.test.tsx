import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FAQ } from "../../patterns/FAQ";

describe("FAQ", () => {
  it("renders", () => {
    const { container } = render(
      <FAQ items={[{ question: "q", answer: "a" }]} data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <FAQ asChild items={[{ question: "q", answer: "a" }]} className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </FAQ>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("max-w-3xl");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 엘리먼트가 생기지 않는다
    expect(root?.parentElement).toBe(container);
  });
});
