import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "../../composites/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeDefined();
  });

  it("renders Card.Header", () => {
    render(
      <Card>
        <Card.Header>Title</Card.Header>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeDefined();
  });

  it("renders Card.Body", () => {
    render(
      <Card>
        <Card.Body>Body text</Card.Body>
      </Card>,
    );
    expect(screen.getByText("Body text")).toBeDefined();
  });

  it("renders Card.Footer", () => {
    render(
      <Card>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );
    expect(screen.getByText("Footer")).toBeDefined();
  });
});
