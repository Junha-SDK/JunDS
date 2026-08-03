import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TestimonialCard } from "../../composites/TestimonialCard";

describe("TestimonialCard", () => {
  it("renders", () => {
    const { container } = render(
      <TestimonialCard quote="좋아요" authorName="홍길동" data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
