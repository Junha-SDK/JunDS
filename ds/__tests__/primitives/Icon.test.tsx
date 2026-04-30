import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Icon } from "../../primitives/Icon";

describe("Icon", () => {
  it("renders", () => {
    const { container } = render(<Icon data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
