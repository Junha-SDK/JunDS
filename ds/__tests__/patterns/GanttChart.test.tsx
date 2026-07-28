import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GanttChart } from "../../patterns/GanttChart";

describe("GanttChart", () => {
  it("renders", () => {
    const { container } = render(
      <GanttChart
        tasks={[{ id: "a", name: "A", start: "2026-04-01", end: "2026-04-05" }]}
        data-testid="root"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
