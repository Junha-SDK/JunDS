import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CronExpression } from "../../composites/CronExpression";

describe("CronExpression", () => {
  it("renders without throwing", () => {
    const { container } = render(<CronExpression value="" onChange={() => {}} />);
    expect(container.firstChild).toBeDefined();
  });
});
