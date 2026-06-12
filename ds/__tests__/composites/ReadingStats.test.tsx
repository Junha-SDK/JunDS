import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReadingStats } from "../../composites/ReadingStats";

describe("ReadingStats", () => {
  it("renders", () => {
    const { container } = render(
      <ReadingStats pagesToday={10} streakDays={3} booksCompleted={5} totalMinutes={120} />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
