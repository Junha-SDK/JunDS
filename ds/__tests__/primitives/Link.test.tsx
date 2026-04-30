import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Link } from "../../primitives/Link";

describe("Link", () => {
  it("renders", () => {
    const { container } = render(<Link href="/x" data-testid="root">link</Link>);
    expect(container.firstChild).toBeTruthy();
  });
});
