import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RelatedPosts } from "../../composites/RelatedPosts";

const POSTS = [
  { id: "a", title: "첫 글", category: "Backend" },
  { id: "b", title: "둘째 글" },
  { id: "c", title: "셋째 글" },
  { id: "d", title: "넷째 글" },
  { id: "e", title: "다섯째 글" },
];

describe("RelatedPosts", () => {
  it("renders without throwing", () => {
    const { container } = render(<RelatedPosts posts={[]} />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders nothing when there are no posts", () => {
    const { container } = render(<RelatedPosts posts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("caps the list at max", () => {
    const { container } = render(<RelatedPosts posts={POSTS} />);
    expect(container.querySelectorAll("a")).toHaveLength(4);
  });

  it("falls back to id when href is missing", () => {
    const { container } = render(<RelatedPosts posts={[POSTS[0]]} />);
    expect(container.querySelector("a")).toHaveAttribute("href", "a");
  });

  it("prefers an explicit href", () => {
    const { container } = render(
      <RelatedPosts posts={[{ id: "a", title: "글", href: "/blog/a" }]} />,
    );
    expect(container.querySelector("a")).toHaveAttribute("href", "/blog/a");
  });

  it("shows the category when given", () => {
    render(<RelatedPosts posts={[POSTS[0]]} />);
    expect(screen.getByText("Backend")).toBeInTheDocument();
  });

  it("labels the section with its title", () => {
    render(<RelatedPosts posts={[POSTS[0]]} title="이어서 읽기" />);
    expect(screen.getByRole("region", { name: "이어서 읽기" })).toBeInTheDocument();
  });

  it("uses a custom link renderer when provided", () => {
    render(
      <RelatedPosts
        posts={[POSTS[0]]}
        renderLink={({ href, children }) => (
          <span data-testid="custom" data-href={href}>
            {children}
          </span>
        )}
      />,
    );
    expect(screen.getByTestId("custom")).toHaveAttribute("data-href", "a");
  });
});
