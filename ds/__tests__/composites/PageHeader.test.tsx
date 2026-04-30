import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageHeader } from "../../composites/PageHeader";

describe("PageHeader", () => {
  it("renders", () => {
    const { container } = render(<PageHeader data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
