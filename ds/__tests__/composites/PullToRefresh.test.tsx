import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PullToRefresh } from "../../composites/PullToRefresh";

describe("PullToRefresh", () => {
  it("renders without throwing", () => {
    const { container } = render(
      <PullToRefresh onRefresh={() => Promise.resolve()}>{null}</PullToRefresh>,
    );
    expect(container.firstChild).toBeDefined();
  });
});
