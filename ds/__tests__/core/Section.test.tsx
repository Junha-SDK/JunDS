import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "@/ds/core/Section";

describe("Section", () => {
  it("renders a section element with children", () => {
    const { container } = render(<Section>내용</Section>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveTextContent("내용");
  });

  it("renders title as a heading and description as dimmed text", () => {
    render(
      <Section title="제목" description="설명">
        x
      </Section>,
    );
    expect(screen.getByRole("heading", { name: "제목" })).toBeInTheDocument();
    expect(screen.getByText("설명")).toBeInTheDocument();
  });

  it("omits the header block when no title/description", () => {
    render(<Section>x</Section>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("border prop draws a bordered card", () => {
    const { container } = render(<Section border>x</Section>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.borderRadius).not.toBe("");
  });
});
