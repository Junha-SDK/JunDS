import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NavigationMenu } from "../../composites/NavigationMenu";

describe("NavigationMenu", () => {
  it("renders without throwing", () => {
    const { container } = render(<NavigationMenu items={[]} />);
    expect(container.firstChild).toBeDefined();
  });
});
