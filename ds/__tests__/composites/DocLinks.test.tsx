import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DocLinks } from "../../composites/DocLinks";

describe("DocLinks", () => {
  it("renders without throwing", () => {
    const { container } = render(<DocLinks links={[]} />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<DocLinks links={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("opens every link in a new tab without leaking the opener", () => {
    const { container } = render(
      <DocLinks links={[{ href: "https://example.com", label: "예시" }]} />,
    );
    const a = container.querySelector("a")!;
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a badge when given", () => {
    render(
      <DocLinks links={[{ href: "https://x.com", label: "저장소", badge: "GitHub" }]} />,
    );
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("renders one row per link", () => {
    const { container } = render(
      <DocLinks
        links={[
          { href: "https://github.com/a/b", label: "GitHub" },
          { href: "https://apps.apple.com/app/id1", label: "App Store" },
          { href: "https://www.npmjs.com/package/x", label: "npm" },
          { href: "https://www.figma.com/file/x", label: "Figma" },
          { href: "https://example.com", label: "기타" },
        ]}
      />,
    );
    expect(container.querySelectorAll("li")).toHaveLength(5);
    // 아이콘은 장식이므로 접근성 트리에 노출되지 않아야 한다
    container.querySelectorAll("svg").forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("honors an explicit kind over inference", () => {
    const { container } = render(
      <DocLinks links={[{ href: "https://example.com", label: "저장소", kind: "github" }]} />,
    );
    // github 아이콘은 fill 기반 path 하나 — external 아이콘(stroke 2개 path)과 구분된다
    expect(container.querySelectorAll("a svg")[0].querySelectorAll("path")).toHaveLength(1);
  });
});
