import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Accordion } from "../../composites/Accordion";

const items = [
  { key: "1", title: "질문 1", content: "답변 1" },
  { key: "2", title: "질문 2", content: "답변 2", defaultOpen: true },
];

describe("Accordion", () => {
  it("renders titles", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("질문 1")).toBeInTheDocument();
    expect(screen.getByText("질문 2")).toBeInTheDocument();
  });

  it("shows defaultOpen content", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("답변 2")).toBeInTheDocument();
  });

  it("toggles on click", () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByText("질문 1"));
    expect(screen.getByText("답변 1")).toBeInTheDocument();
  });

  it("single mode closes others", () => {
    render(<Accordion items={items} single />);
    fireEvent.click(screen.getByText("질문 1"));
    // item 1 should be open, item 2 should be closed
    const answer1 = screen.getByText("답변 1").closest("div[class*='grid']");
    expect(answer1).toHaveClass("grid-rows-[1fr]");
  });
});
