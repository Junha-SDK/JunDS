import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PricingTable } from "../../composites/PricingTable";

describe("PricingTable", () => {
  it("renders", () => {
    const { container } = render(<PricingTable plans={[{id:"a",name:"A",price:"$1",features:["x"]}]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
