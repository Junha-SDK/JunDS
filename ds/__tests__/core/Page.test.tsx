import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Page } from "@/ds/core/Page";

function pageRoot(container: HTMLElement): HTMLElement {
  // Box may render a leading <style> for responsive CSS; pick the first
  // non-<style> child as the actual page wrapper.
  const candidates = Array.from(container.children) as HTMLElement[];
  const root = candidates.find((c) => c.tagName !== "STYLE");
  if (!root) throw new Error("page root not found");
  return root;
}

describe("Page", () => {
  it("renders its children", () => {
    render(
      <Page>
        <div data-testid="child">x</div>
      </Page>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies maxWidth='xl' (1280px) by default", () => {
    const { container } = render(<Page>x</Page>);
    expect(pageRoot(container).style.maxWidth).toBe("1280px");
  });

  it("respects an explicit maxWidth prop", () => {
    const { container } = render(<Page maxWidth="md">x</Page>);
    expect(pageRoot(container).style.maxWidth).toBe("768px");
  });

  it("takes full width inside its max-width constraint", () => {
    const { container } = render(<Page>x</Page>);
    expect(pageRoot(container).style.width).toBe("100%");
  });
});

describe("Page.Header", () => {
  it("renders the title as an h1", () => {
    render(<Page.Header title="Dashboard" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Dashboard");
  });

  it("renders the description when provided", () => {
    render(<Page.Header title="Settings" description="Manage account" />);
    expect(screen.getByText("Manage account")).toBeInTheDocument();
  });

  it("renders an actions slot when provided", () => {
    render(
      <Page.Header
        title="Users"
        actions={<button data-testid="cta">New</button>}
      />,
    );
    expect(screen.getByTestId("cta")).toBeInTheDocument();
  });

  it("renders a breadcrumb slot when provided", () => {
    render(
      <Page.Header
        title="Users"
        breadcrumb={<nav data-testid="bc">a / b</nav>}
      />,
    );
    expect(screen.getByTestId("bc")).toBeInTheDocument();
  });
});

describe("Page.Body", () => {
  it("renders its children", () => {
    render(
      <Page.Body>
        <div data-testid="a">A</div>
        <div data-testid="b">B</div>
      </Page.Body>,
    );
    expect(screen.getByTestId("a")).toBeInTheDocument();
    expect(screen.getByTestId("b")).toBeInTheDocument();
  });
});
