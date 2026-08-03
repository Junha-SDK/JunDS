import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TestimonialCard } from "../../composites/TestimonialCard";

describe("TestimonialCard", () => {
  it("renders", () => {
    const { container } = render(
      <TestimonialCard quote="좋아요" authorName="홍길동" data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild 로 자식 엘리먼트가 root 가 되고 className 이 병합된다", () => {
    const { container } = render(
      <TestimonialCard asChild className="extra" quote="좋아요" authorName="홍길동">
        <a href="#" className="child">
          y
        </a>
      </TestimonialCard>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(container.children).toHaveLength(1);
    expect(root.className).toContain("extra");
    expect(root.className).toContain("child");
  });
});
