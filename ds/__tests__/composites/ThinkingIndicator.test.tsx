import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThinkingIndicator } from "../../composites/ThinkingIndicator";

describe("ThinkingIndicator", () => {
  it("renders", () => {
    const { container } = render(<ThinkingIndicator data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild 로 자식 엘리먼트가 root 가 되고 className 이 병합된다", () => {
    const { container } = render(
      <ThinkingIndicator asChild className="extra">
        <a href="#" className="child">
          y
        </a>
      </ThinkingIndicator>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(container.children).toHaveLength(1);
    expect(root.className).toContain("extra");
    expect(root.className).toContain("child");
  });
});
