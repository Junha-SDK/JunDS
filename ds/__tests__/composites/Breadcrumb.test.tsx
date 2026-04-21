import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Breadcrumb } from "../../composites/Breadcrumb";

describe("Breadcrumb", () => {
  const items = [
    { label: "홈", href: "/" },
    { label: "프로젝트", href: "/projects" },
    { label: "설정" },
  ];

  it("renders all items", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(screen.getByText("프로젝트")).toBeInTheDocument();
    expect(screen.getByText("설정")).toBeInTheDocument();
  });

  it("renders links for non-last items", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("홈").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("프로젝트").closest("a")).toHaveAttribute("href", "/projects");
    expect(screen.getByText("설정").closest("a")).toBeNull();
  });

  it("has nav with aria-label", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
  });
});
