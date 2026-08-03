import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TocHeading } from "../../composites/TableOfContents/TocHeading";

describe("TocHeading", () => {
  it("renders", () => {
    const { container } = render(<TocHeading level={2}>들어가며</TocHeading>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("H2");
  });

  it("asChild 로 자식 엘리먼트가 root 가 되고 className 이 병합된다", () => {
    const { container } = render(
      <TocHeading asChild className="extra" label="y">
        <a href="#" className="child">
          y
        </a>
      </TocHeading>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(container.children).toHaveLength(1);
    expect(root.className).toContain("extra");
    expect(root.className).toContain("child");
  });
});
