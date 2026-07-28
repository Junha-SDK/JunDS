import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CartItem } from "../../composites/CartItem";

describe("CartItem", () => {
  it("renders", () => {
    const { container } = render(
      <CartItem title="t" price="₩1,000" quantity={1} data-testid="root" />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
