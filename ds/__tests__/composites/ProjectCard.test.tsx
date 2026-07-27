import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProjectCard } from "../../composites/ProjectCard";

describe("ProjectCard", () => {
  it("renders without throwing", () => {
    const { container } = render(<ProjectCard title="" />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders as an article when there is no href", () => {
    const { container } = render(<ProjectCard title="JunDS" subtitle="디자인 시스템" />);
    expect(container.querySelector("article")).toBeTruthy();
    expect(container.querySelector("a")).toBeNull();
    expect(screen.getByText("디자인 시스템")).toBeInTheDocument();
  });

  it("renders as a link when href is given", () => {
    const { container } = render(<ProjectCard title="JunDS" href="/docs/junds" />);
    expect(container.querySelector("a")).toHaveAttribute("href", "/docs/junds");
  });

  it("marks http(s) hrefs as external", () => {
    const { container } = render(
      <ProjectCard title="GitHub" href="https://github.com/x" />,
    );
    const a = container.querySelector("a")!;
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("calls onPrefetch on hover and focus", () => {
    const onPrefetch = vi.fn();
    const { container } = render(
      <ProjectCard title="JunDS" href="/docs" onPrefetch={onPrefetch} />,
    );
    const a = container.querySelector("a")!;
    fireEvent.mouseEnter(a);
    fireEvent.focus(a);
    expect(onPrefetch).toHaveBeenCalledTimes(2);
  });

  it("uses a custom link renderer when provided", () => {
    render(
      <ProjectCard
        title="JunDS"
        href="/docs"
        renderLink={({ href, children }) => (
          <span data-testid="custom" data-href={href}>
            {children}
          </span>
        )}
      />,
    );
    expect(screen.getByTestId("custom")).toHaveAttribute("data-href", "/docs");
  });
});
