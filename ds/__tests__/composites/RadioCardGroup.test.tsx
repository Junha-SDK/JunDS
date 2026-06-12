import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RadioCardGroup } from "../../composites/RadioCardGroup";

describe("RadioCardGroup", () => {
  it("renders", () => {
    const { container } = render(<RadioCardGroup options={[{value:"a",title:"A"}]} data-testid="root" />);
    expect(container.firstChild).toBeTruthy();
  });
});
