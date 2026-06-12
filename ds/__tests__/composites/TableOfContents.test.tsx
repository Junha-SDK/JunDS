import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TableOfContents } from "../../composites/TableOfContents";

describe("TableOfContents", () => {
  it("renders", () => {
    const { container } = render(<TableOfContents items={[{id:"a",label:"A",level:2}]} activeTracking={false} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
