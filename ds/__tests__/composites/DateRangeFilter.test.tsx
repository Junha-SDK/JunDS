import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DateRangeFilter } from "../../composites/DateRangeFilter";

describe("DateRangeFilter", () => {
  it("renders without throwing", () => {
    const { container } = render(
      <DateRangeFilter
        startDate=""
        endDate=""
        onStartChange={() => {}}
        onEndChange={() => {}}
        onApply={() => {}}
      />,
    );
    expect(container.firstChild).toBeDefined();
  });
});
