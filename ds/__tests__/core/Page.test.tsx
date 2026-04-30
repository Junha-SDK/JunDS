import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Page } from "@/ds/core/Page";

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
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.maxWidth).toBe("1280px");
  });

  it("respects an explicit maxWidth prop", () => {
    const { container } = render(<Page maxWidth="md">x</Page>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.maxWidth).toBe("768px");
  });

  it("centers itself horizontally (mx='auto')", () => {
    const { container } = render(<Page>x</Page>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.marginInline).toBe("auto");
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

  it("does not render description when not provided", () => {
    const { container } = render(<Page.Header title="Empty" />);
    // The header section: only the heading should be there.
    expect(container.querySelectorAll("p").length).toBe(0);
  });
});

describe("Page.Body", () => {
  it("renders its children with a flex column layout", () => {
    const { container } = render(
      <Page.Body>
        <div data-testid="a">A</div>
        <div data-testid="b">B</div>
      </Page.Body>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("column");
    expect(screen.getByTestId("a")).toBeInTheDocument();
    expect(screen.getByTestId("b")).toBeInTheDocument();
  });
});
