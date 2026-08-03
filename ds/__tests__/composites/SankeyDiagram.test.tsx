import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SankeyDiagram } from "../../composites/SankeyDiagram";

describe("SankeyDiagram", () => {
  it("renders", () => {
    const { container } = render(
      <SankeyDiagram
        nodes={[{ id: "A" }, { id: "B" }]}
        links={[{ source: "A", target: "B", value: 5 }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild 로 자식 엘리먼트가 root 가 되고 className 이 병합된다", () => {
    const { container } = render(
      <SankeyDiagram
        asChild
        className="extra"
        nodes={[{ id: "A" }, { id: "B" }]}
        links={[{ source: "A", target: "B", value: 5 }]}
      >
        <a href="#" className="child">
          y
        </a>
      </SankeyDiagram>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(container.children).toHaveLength(1);
    expect(root.className).toContain("extra");
    expect(root.className).toContain("child");
  });
});
