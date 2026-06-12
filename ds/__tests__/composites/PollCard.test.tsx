import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PollCard } from "../../composites/PollCard";

describe("PollCard", () => {
  it("renders", () => {
    const { container } = render(
      <PollCard
        question="좋아하는 색?"
        options={[
          { id: "a", label: "빨강", votes: 10 },
          { id: "b", label: "파랑", votes: 8 },
        ]}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
