import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageHeader } from "../../composites/PageHeader";

describe("PageHeader", () => {
  it("renders", () => {
    const { container } = render(<PageHeader title="x" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild renders the child element as root and merges className", () => {
    const { container } = render(
      <PageHeader asChild title="x" className="extra-class">
        <a href="#" className="child">
          y
        </a>
      </PageHeader>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("A");
    expect(root?.className).toContain("flex");
    expect(root?.className).toContain("extra-class");
    expect(root?.className).toContain("child");
    // 래퍼 header 가 생기지 않는다
    expect(container.querySelector("header")).toBeNull();
    expect(root?.parentElement).toBe(container);
  });
});
