import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SocialShare } from "../../composites/SocialShare";

describe("SocialShare", () => {
  it("renders", () => {
    const { container } = render(<SocialShare url="https://x.com" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("asChild 로 자식 엘리먼트가 root 가 되고 className 이 병합된다", () => {
    const { container } = render(
      <SocialShare asChild className="extra" url="https://x.com">
        <a href="#" className="child">
          y
        </a>
      </SocialShare>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(container.children).toHaveLength(1);
    expect(root.className).toContain("extra");
    expect(root.className).toContain("child");
  });
});
