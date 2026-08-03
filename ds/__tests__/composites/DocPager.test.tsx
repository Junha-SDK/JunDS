import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DocPager } from "../../composites/DocPager";

describe("DocPager", () => {
  it("renders without throwing", () => {
    const { container } = render(<DocPager />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders nothing when neither prev nor next is given", () => {
    const { container } = render(<DocPager />);
    expect(container.firstChild).toBeNull();
  });

  it("renders both links with their labels", () => {
    render(
      <DocPager prev={{ href: "/a", title: "앞 문서" }} next={{ href: "/b", title: "뒤 문서" }} />,
    );
    expect(screen.getByText("앞 문서")).toBeInTheDocument();
    expect(screen.getByText("뒤 문서")).toBeInTheDocument();
    expect(screen.getByText(/이전 문서/)).toBeInTheDocument();
    expect(screen.getByText(/다음 문서/)).toBeInTheDocument();
  });

  it("keeps a placeholder so 'next' stays on the right when 'prev' is missing", () => {
    const { container } = render(<DocPager next={{ href: "/b", title: "뒤" }} />);
    const nav = container.querySelector("nav")!;
    // 첫 칸은 빈 자리, 두 번째 칸이 실제 링크
    expect(nav.children).toHaveLength(2);
    expect(nav.children[0].tagName).toBe("DIV");
    expect(nav.children[1].tagName).toBe("A");
  });

  it("uses a custom link renderer when provided", () => {
    render(
      <DocPager
        next={{ href: "/b", title: "뒤" }}
        renderLink={({ href, className, children }) => (
          <span data-testid="custom" data-href={href} className={className}>
            {children}
          </span>
        )}
      />,
    );
    expect(screen.getByTestId("custom")).toHaveAttribute("data-href", "/b");
  });
});
