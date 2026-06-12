import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OnlineStatus } from "../../composites/OnlineStatus";

describe("OnlineStatus", () => {
  it("renders", () => {
    const { container } = render(<OnlineStatus status="online" data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
